from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Dict, Any

from backend.app.core.network import get_client_ip
from backend.app.schemas.auth import (
    GoogleLoginRequest,
    ResearcherLoginRequest,
    TokenResponse,
    UserOut,
    LogoutResponse
)
from backend.app.services.auth_service import auth_service
from backend.app.services.token_revocation_store import security_store
from backend.app.core.dependencies import get_current_user

router = APIRouter()


@router.post(
    "/google",
    response_model=TokenResponse,
    summary="Autentikasi Google OAuth (ID Token)",
    description="Memverifikasi tanda tangan kriptografis, audience, issuer, dan expiration dari Google ID Token secara aman."
)
async def login_google_id_token(request: Request, payload: GoogleLoginRequest):
    security_store.check_and_record_login_attempt(
        get_client_ip(request),
        max_attempts=5,
        window_seconds=60,
        scope="google_auth",
    )
    return await auth_service.authenticate_google_id_token(
        id_token=payload.id_token,
        remember_me=payload.remember_me
    )


@router.post(
    "/researcher/login",
    response_model=TokenResponse,
    summary="Autentikasi Khusus Tim Peneliti Resmi (P-001)",
    description="Memverifikasi kredensial peneliti terotorisasi dan menghasilkan access token peran 'researcher'."
)
async def login_researcher(request: Request, payload: ResearcherLoginRequest):
    security_store.check_and_record_login_attempt(
        get_client_ip(request),
        max_attempts=5,
        window_seconds=60,
        scope="researcher_auth",
    )
    return auth_service.authenticate_researcher(
        email=payload.email,
        password=payload.password,
        remember_me=payload.remember_me
    )


@router.get(
    "/me",
    response_model=UserOut,
    summary="Profil Pengguna Sesi Aktif",
    description="Mengembalikan data identitas dan peran (role) dari token autentikasi yang sedang digunakan."
)
async def get_current_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    return UserOut(
        email=user.get("sub", ""),
        role=user.get("role", "student"),
        name=user.get("name", ""),
        subject_id=user.get("subject_id", ""),
        grade=user.get("grade", "SMP Kelas VII"),
        picture=user.get("picture"),
        auth_provider=user.get("auth_provider", "local")
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout & Pencabutan Sesi (Token Revocation)",
    description="Mengakhiri sesi dan mencatat ID Token (JTI) ke penyimpanan persisten agar tidak dapat digunakan lagi."
)
async def logout(user: Dict[str, Any] = Depends(get_current_user)):
    jti = user.get("jti")
    exp = user.get("exp")
    if not isinstance(jti, str) or not isinstance(exp, (int, float)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token autentikasi tidak valid.")
    if not auth_service.revoke_token(jti, expires_at=exp):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Logout is temporarily unavailable.")
    return LogoutResponse(revoked=True)
