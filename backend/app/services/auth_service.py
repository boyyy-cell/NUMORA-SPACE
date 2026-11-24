import asyncio
from functools import partial
import re
import secrets
import time
from typing import Any, Dict, Optional
from datetime import timedelta
from fastapi import HTTPException
from google.auth.exceptions import GoogleAuthError, TransportError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token

from backend.app.core.config import settings
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.schemas.auth import UserOut, TokenResponse
from backend.app.services.token_revocation_store import security_store


class AuthService:
    def __init__(self, custom_security_store=None):
        # Penyimpanan persisten SQLite untuk Revocation Blacklist, Rate Limiting, & Persistent Users
        self._security_store = custom_security_store or security_store

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self._security_store.get_user_by_email(email)

    def provision_researcher_account(
        self,
        email: str,
        password: str,
        name: str = "Peneliti Matematika Terdaftar",
        subject_id: str = "P-001"
    ) -> Dict[str, Any]:
        """
        Mekanisme provisioning akun peneliti terotorisasi server-side.
        HANYA dapat dipanggil secara internal/programmatis oleh server administrator,
        BUKAN melalui rute pendaftaran publik yang dapat diakses sembarang pengguna.
        """
        clean_email = (email or '').strip().lower()
        if not clean_email or '@' not in clean_email:
            raise ValueError("Email peneliti tidak valid.")
        if len(password) < 6:
            raise ValueError("Kata sandi peneliti minimal 6 karakter.")

        return self._security_store.provision_researcher(
            email=clean_email,
            hashed_password=hash_password(password),
            name=name,
            subject_id=subject_id
        )

    def authenticate_researcher(self, email: str, password: str, remember_me: bool = True) -> TokenResponse:
        clean_email = (email or "").strip().lower()
        if not clean_email or "@" not in clean_email:
            raise HTTPException(status_code=400, detail="Alamat email peneliti tidak valid.")
        if not password or len(password) < 6:
            raise HTTPException(status_code=400, detail="Kata sandi peneliti tidak valid.")

        user_data = self._security_store.get_user_by_email(clean_email)
        if not user_data:
            raise HTTPException(
                status_code=401,
                detail="Kredensial peneliti tidak valid. Hanya akun peneliti resmi terdaftar yang dapat masuk."
            )

        if not verify_password(password, user_data.get("hashed_password", "")):
            raise HTTPException(
                status_code=401,
                detail="Kredensial peneliti tidak valid. Kata sandi salah."
            )

        role = user_data.get("role")
        is_provisioned = bool(user_data.get("is_provisioned_researcher"))
        if role != "researcher" or not is_provisioned:
            raise HTTPException(
                status_code=403,
                detail="Akses ditolak: Akun ini tidak memiliki hak akses sebagai peneliti."
            )

        subject_id = user_data.get("subject_id", "P-001")
        name = user_data.get("name", "Tim Peneliti")
        grade = user_data.get("grade", "Evaluator Pembelajaran")

        expires_delta = timedelta(hours=24 if remember_me else 8)
        expires_seconds = int(expires_delta.total_seconds())

        token_payload = {
            "sub": clean_email,
            "role": "researcher",
            "name": name,
            "subject_id": subject_id,
            "grade": grade,
            "auth_provider": user_data.get("auth_provider", "local"),
            "picture": None
        }

        token = create_access_token(token_payload, expires_delta=expires_delta)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=expires_seconds,
            user=UserOut(
                email=clean_email,
                role="researcher",
                name=name,
                subject_id=subject_id,
                grade=grade,
                description=user_data.get("description", "Peneliti Resmi Terdaftar"),
                picture=None,
                auth_provider=user_data.get("auth_provider", "local")
            )
        )

    async def authenticate_google_id_token(self, id_token: str, remember_me: bool = True) -> TokenResponse:
        if not id_token or not isinstance(id_token, str):
            raise HTTPException(
                status_code=400,
                detail="Google ID token is required."
            )
        if len(id_token) > 8192:
            raise HTTPException(status_code=400, detail="Google ID token is invalid.")
        raw_client_ids = [cid.strip() for cid in (settings.GOOGLE_CLIENT_ID or "").split(",") if cid.strip()]
        if not raw_client_ids:
            raise HTTPException(
                status_code=503,
                detail="Google authentication is unavailable."
            )
        try:
            # If a single client ID is configured, verify audience directly in verify_oauth2_token;
            # If multiple client IDs are configured, verify cryptographic signature first, then match audience.
            primary_audience = raw_client_ids[0] if len(raw_client_ids) == 1 else None
            data = await asyncio.to_thread(
                google_id_token.verify_oauth2_token,
                id_token,
                partial(GoogleRequest(), timeout=6),
                primary_audience
            )
        except TransportError:
            raise HTTPException(
                status_code=503,
                detail="Google authentication is temporarily unavailable."
            )
        except (ValueError, GoogleAuthError):
            raise HTTPException(status_code=401, detail="Google ID token is invalid.")

        now = int(time.time())
        issuer = data.get("iss")
        audience = data.get("aud")
        audience_matches = any(
            audience == cid or (isinstance(audience, list) and cid in audience)
            for cid in raw_client_ids
        )
        exp = data.get("exp")
        sub = data.get("sub")
        email = data.get("email")
        if (
            issuer not in ("accounts.google.com", "https://accounts.google.com")
            or not audience_matches
            or isinstance(exp, bool)
            or not isinstance(exp, (int, float))
            or exp <= now
            or not isinstance(sub, str)
            or not sub.strip()
            or not isinstance(email, str)
            or not re.fullmatch(r"[A-Za-z0-9_.+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+", email)
            or data.get("email_verified") is not True
        ):
            raise HTTPException(
                status_code=401,
                detail="Google ID token is invalid."
            )
        clean_email = email.strip().lower()
        name = data.get("name") or clean_email.split('@')[0]
        picture = data.get("picture")

        user_data = self._security_store.get_user_by_email(clean_email)
        if not user_data:
            try:
                user_data = self._security_store.create_user(
                    email=clean_email,
                    hashed_password=hash_password(secrets.token_urlsafe(48)),
                    name=name,
                    grade="SMP Kelas VII",
                    description="Akun Google Terverifikasi Resmi",
                    auth_provider="google"
                )
            except HTTPException as exc:
                if exc.status_code != 409:
                    raise
                user_data = self._security_store.get_user_by_email(clean_email)
                if not user_data:
                    raise

        role = user_data["role"]
        if role not in ("student", "researcher") or (
            role == "researcher" and not bool(user_data.get("is_provisioned_researcher"))
        ):
            raise HTTPException(status_code=401, detail="Google ID token is invalid.")
        subject_id = user_data["subject_id"]
        grade = user_data.get("grade", "SMP Kelas VII")

        expires_delta = timedelta(hours=24 if remember_me else 4)
        expires_seconds = int(expires_delta.total_seconds())

        token_payload = {
            "sub": clean_email,
            "role": role,
            "name": name,
            "subject_id": subject_id,
            "grade": grade,
            "auth_provider": "google",
            "picture": picture
        }

        token = create_access_token(token_payload, expires_delta=expires_delta)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=expires_seconds,
            user=UserOut(
                email=clean_email,
                role=role,
                name=name,
                subject_id=subject_id,
                grade=grade,
                description="Akun Google Terverifikasi Resmi",
                picture=picture,
                auth_provider="google"
            )
        )

    def revoke_token(self, jti: str, expires_at: int = 0) -> bool:
        if jti:
            return self._security_store.revoke_token(jti, expires_at=expires_at)
        return False

    def is_token_revoked(self, jti: str) -> bool:
        """Memeriksa apakah token telah dicabut / di-logout dari database persisten."""
        return self._security_store.is_token_revoked(jti)

    def cleanup_expired_tokens(self) -> int:
        """Membersihkan token kedaluwarsa dari database persisten."""
        return self._security_store.cleanup_expired_tokens()


auth_service = AuthService()
