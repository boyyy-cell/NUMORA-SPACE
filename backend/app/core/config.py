import ipaddress
import json
import math
import secrets
from collections import Counter
from pathlib import Path
from typing import List, Optional, Union
from pydantic import PrivateAttr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    _development_jwt_secret: str = PrivateAttr(default_factory=lambda: secrets.token_urlsafe(48))

    APP_NAME: str = "NUMORA Space API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5178",
        "http://127.0.0.1:5178",
        "http://192.168.1.7:5178",
        "http://192.168.1.7:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://numora-space.vercel.app"
    ]

    JWT_SECRET_KEY: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Trusted Proxies (Hanya IP ini yang diizinkan meneruskan X-Forwarded-For)
    TRUSTED_PROXIES: List[str] = []

    # Database Settings (PostgreSQL Neon / SQLite fallback)
    DATABASE_URL: Optional[str] = None
    NUMORA_SECURITY_DB_PATH: Optional[str] = None

    # Supabase Integration Settings (Server Confidential)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # AI Integration Settings
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_AI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parents[3] / ".env",
            Path(__file__).resolve().parents[2] / ".env"
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    return [i.strip() for i in v.split(",") if i.strip()]
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return [origin.strip() for origin in v if isinstance(origin, str) and origin.strip()]
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5178",
            "http://127.0.0.1:5178",
            "http://192.168.1.7:5178",
            "http://192.168.1.7:5173",
            "https://numora-space.vercel.app"
        ]

    @field_validator("TRUSTED_PROXIES")
    @classmethod
    def validate_trusted_proxies(cls, proxies: List[str]) -> List[str]:
        validated = []
        for proxy in proxies:
            try:
                network = ipaddress.ip_network(proxy.strip(), strict=False)
            except ValueError as exc:
                raise ValueError("TRUSTED_PROXIES must contain valid IP addresses or CIDRs.") from exc
            if network.prefixlen == 0:
                raise ValueError("TRUSTED_PROXIES cannot trust every IP address.")
            validated.append(network.with_prefixlen)
        return validated

    @property
    def jwt_signing_secret(self) -> str:
        return self.JWT_SECRET_KEY or self._development_jwt_secret

    def validate_production_security(self) -> None:
        if (self.ENVIRONMENT or "").strip().lower() == "production":
            secret = self.JWT_SECRET_KEY or ""
            counts = Counter(secret)
            entropy = -sum(
                (count / len(secret)) * math.log2(count / len(secret))
                for count in counts.values()
            ) if secret else 0
            if len(secret) < 32 or len(counts) < 8 or entropy < 3.0:
                raise ValueError(
                    "Invalid production JWT configuration; provide a cryptographically random "
                    "JWT_SECRET_KEY of at least 32 characters."
                )
        if self.JWT_ALGORITHM != "HS256":
            raise ValueError("Only the HS256 JWT algorithm is supported.")


settings = Settings()

