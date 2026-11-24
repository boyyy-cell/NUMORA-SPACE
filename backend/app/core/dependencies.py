from typing import Optional, List, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.app.core.security import (
    decode_access_token,
    TokenExpiredError,
    InvalidTokenError
)
from backend.app.services.auth_service import auth_service

oauth2_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme)
) -> Dict[str, Any]:
    """
    Ekstraksi dan validasi token autentikasi Bearer JWT.
    Memverifikasi tanda tangan kriptografis HS256, masa berlaku token, dan status revocation.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Header 'Authorization: Bearer <token>' tidak ditemukan.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi autentikasi telah kedaluwarsa. Silakan masuk kembali.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token autentikasi tidak valid.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    jti = payload.get("jti")
    if auth_service.is_token_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi ini telah di-logout dan dicabut dari server.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    account = auth_service.get_user_by_email(payload["sub"])
    if (
        account is None
        or account.get("role") != payload.get("role")
        or account.get("subject_id") != payload.get("subject_id")
        or payload.get("role") not in ("student", "researcher")
        or (
            payload.get("role") == "researcher"
            and not bool(account.get("is_provisioned_researcher"))
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token autentikasi tidak valid.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return payload


def require_role(allowed_roles: List[str]):
    """
    Dependency factory untuk Role-Based Access Control (RBAC).
    Memeriksa apakah peran pengguna terdaftar dalam allowed_roles.
    Jika tidak, mengembalikan HTTP 403 Forbidden.
    """
    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akses ditolak. Diperlukan peran peneliti."
            )
        return user

    return role_checker


# Spesialisasi peran
require_researcher = require_role(["researcher"])
require_student = require_role(["student", "researcher"])


async def require_student_digital_access(
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Memastikan bahwa pengguna terautentikasi memiliki izin untuk mengakses intervensi pembelajaran digital.
    ATURAN KESELAMATAN PENELITIAN:
    S-001 adalah subjek kelompok kontrol tatap muka langsung bersama peneliti.
    S-001 DILARANG mengakses modul aljabar digital, kuis evaluasi digital, dan permainan NUMORA RUN
    sebagai bentuk intervensi agar validitas penelitian eksperimental tidak terdistorsi.
    Namun, autentikasi, logout, dan pemulihan sesi S-001 tetap sepenuhnya berfungsi.
    """
    subject_id = user.get("subject_id")
    if subject_id == "S-001":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Akses ditolak: Subjek S-001 dialokasikan untuk protokol kelompok kontrol tatap muka langsung "
                "bersama peneliti, sehingga tidak diizinkan mengakses intervensi pembelajaran digital NUMORA Space."
            )
        )
    return user

