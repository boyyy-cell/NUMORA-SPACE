from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class GoogleLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id_token: str = Field(..., description="Google ID Token (JWT) yang diperoleh dari Google Identity Services", min_length=20, max_length=8192)
    remember_me: bool = Field(default=True, description="Simpan sesi lebih lama")


class ResearcherLoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(..., description="Email akun peneliti resmi terdaftar", min_length=5, max_length=128)
    password: str = Field(..., description="Kata sandi akun peneliti", min_length=6, max_length=128)
    remember_me: bool = Field(default=True, description="Simpan sesi lebih lama")


class UserOut(BaseModel):
    email: str
    role: Literal["student", "researcher"] = Field(..., description="Peran otorisasi: 'student' atau 'researcher'")
    name: str
    subject_id: str = Field(..., description="ID Subjek Protokol (misal: S-002, P-001)")
    grade: str = "SMP Kelas VII"
    description: Optional[str] = None
    picture: Optional[str] = None
    auth_provider: str = Field(default="local", description="Penyedia autentikasi: 'local' | 'google'")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="RFC 7519 Cryptographically Signed HS256 JWT")
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Masa berlaku sesi dalam satuan detik")
    user: UserOut


class LogoutResponse(BaseModel):
    status: str = "logged_out"
    revoked: bool
    message: str = "Sesi berhasil diakhiri."
