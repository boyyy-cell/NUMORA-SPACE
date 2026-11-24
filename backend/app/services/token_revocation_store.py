"""
NUMORA Space - Persistent Token Revocation, Rate Limiting & User Storage
Provides enterprise persistence supporting:
- Local SQLite for zero-dependency development and testing.
- Managed PostgreSQL (Neon / Supabase) for production deployment.
"""
import sqlite3
import time
import os
import re
import secrets
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Optional, Dict, Any, Iterator
from fastapi import HTTPException
from backend.app.core.database import (
    db_manager,
    ConnectionProxy,
    DatabaseIntegrityError,
    DB_ERROR_TYPES,
    is_postgres_configured,
    get_default_sqlite_path,
)


RATE_LIMIT_MAX_WINDOW_SECONDS = 24 * 60 * 60
RATE_LIMIT_CLEANUP_INTERVAL_SECONDS = 5 * 60
RATE_LIMIT_CLEANUP_BATCH_SIZE = 10_000


class PersistentSecurityStore:
    def __init__(self, db_path: Optional[str] = None):
        self._lock = threading.Lock()
        self._last_rate_limit_cleanup_at = (
            time.monotonic() - RATE_LIMIT_CLEANUP_INTERVAL_SECONDS
        )
        self._is_explicit_path = db_path is not None
        if not db_path:
            configured_path = os.environ.get("NUMORA_SECURITY_DB_PATH")
            if configured_path:
                self.db_path = configured_path
            else:
                self.db_path = get_default_sqlite_path()
        else:
            self.db_path = db_path
        if self.db_path != ":memory:" and not (self.is_postgres):
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    @property
    def is_postgres(self) -> bool:
        return not self._is_explicit_path and is_postgres_configured()

    @contextmanager
    def _get_connection(self) -> Iterator[ConnectionProxy]:
        explicit_target = self.db_path if self._is_explicit_path else None
        with db_manager.get_connection(explicit_target) as conn:
            yield conn

    def _init_db(self):
        with self._lock:
            with self._get_connection() as conn:
                if self.is_postgres:
                    # PostgreSQL initialization
                    conn.execute("""
                        CREATE TABLE IF NOT EXISTS revoked_tokens (
                            jti VARCHAR(255) PRIMARY KEY,
                            expires_at BIGINT NOT NULL,
                            revoked_at BIGINT NOT NULL
                        )
                    """)
                    conn.execute("""
                        CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires 
                        ON revoked_tokens(expires_at)
                    """)
                    conn.execute("""
                        CREATE TABLE IF NOT EXISTS login_rate_limits (
                            id BIGSERIAL PRIMARY KEY,
                            ip VARCHAR(128) NOT NULL,
                            attempt_time BIGINT NOT NULL
                        )
                    """)
                    conn.execute("""
                        CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time 
                        ON login_rate_limits(ip, attempt_time)
                    """)
                    conn.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            email VARCHAR(255) PRIMARY KEY,
                            hashed_password TEXT NOT NULL,
                            role VARCHAR(50) NOT NULL,
                            name VARCHAR(255) NOT NULL,
                            subject_id VARCHAR(50) NOT NULL,
                            grade VARCHAR(100) NOT NULL,
                            description TEXT,
                            auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
                            created_at BIGINT NOT NULL,
                            is_provisioned_researcher INTEGER NOT NULL DEFAULT 0
                        )
                    """)
                    conn.commit()
                else:
                    # SQLite initialization
                    raw = conn.raw_connection
                    raw.execute("PRAGMA journal_mode = WAL")
                    raw.execute("BEGIN IMMEDIATE")
                    raw.execute("""
                        CREATE TABLE IF NOT EXISTS revoked_tokens (
                            jti TEXT PRIMARY KEY,
                            expires_at INTEGER NOT NULL,
                            revoked_at INTEGER NOT NULL
                        )
                    """)
                    raw.execute("""
                        CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires 
                        ON revoked_tokens(expires_at)
                    """)
                    raw.execute("""
                        CREATE TABLE IF NOT EXISTS login_rate_limits (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            ip TEXT NOT NULL,
                            attempt_time INTEGER NOT NULL
                        )
                    """)
                    raw.execute("""
                        CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time 
                        ON login_rate_limits(ip, attempt_time)
                    """)
                    raw.execute("""
                        CREATE TABLE IF NOT EXISTS users (
                            email TEXT PRIMARY KEY,
                            hashed_password TEXT NOT NULL,
                            role TEXT NOT NULL,
                            name TEXT NOT NULL,
                            subject_id TEXT NOT NULL,
                            grade TEXT NOT NULL,
                            description TEXT,
                            auth_provider TEXT NOT NULL DEFAULT 'local',
                            created_at INTEGER NOT NULL,
                            is_provisioned_researcher INTEGER DEFAULT 0
                        )
                    """)
                    user_columns = {
                        row["name"] for row in raw.execute("PRAGMA table_info(users)")
                    }
                    if "is_provisioned_researcher" not in user_columns:
                        raw.execute(
                            "ALTER TABLE users ADD COLUMN is_provisioned_researcher INTEGER NOT NULL DEFAULT 0"
                        )
                    raw.commit()


    # =========================================================================
    # TOKEN REVOCATION (BLACKLIST)
    # =========================================================================
    def revoke_token(self, jti: str, expires_at: int = 0) -> bool:
        if not isinstance(jti, str) or len(jti) < 16 or not jti.strip():
            return False
        try:
            expires_at = int(expires_at)
        except (TypeError, ValueError, OverflowError):
            return False
        now = int(time.time())
        try:
            with self._lock:
                with self._get_connection() as conn:
                    conn.execute("""
                        INSERT INTO revoked_tokens (jti, expires_at, revoked_at)
                        VALUES (?, ?, ?)
                        ON CONFLICT(jti) DO UPDATE SET
                            expires_at = excluded.expires_at,
                            revoked_at = excluded.revoked_at
                        """, (jti, expires_at, now))
                    conn.commit()
            return True
        except DB_ERROR_TYPES as exc:
            raise HTTPException(status_code=503, detail="Token revocation service is unavailable.") from exc

    def is_token_revoked(self, jti: str) -> bool:
        if not isinstance(jti, str) or not jti.strip():
            return False
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT 1 FROM revoked_tokens WHERE jti = ?", (jti,))
                return cursor.fetchone() is not None
        except DB_ERROR_TYPES as exc:
            raise HTTPException(status_code=503, detail="Authentication service is unavailable.") from exc

    def cleanup_expired_tokens(self) -> int:
        now = int(time.time())
        try:
            with self._lock:
                with self._get_connection() as conn:
                    cursor = conn.execute("DELETE FROM revoked_tokens WHERE expires_at > 0 AND expires_at < ?", (now,))
                    conn.commit()
                    return cursor.rowcount
        except DB_ERROR_TYPES as exc:
            raise HTTPException(status_code=503, detail="Token revocation service is unavailable.") from exc

    # =========================================================================
    # RATE LIMITING (SLIDING WINDOW WITH CONCURRENCY LOCK)
    # =========================================================================
    def check_and_record_login_attempt(
        self,
        ip: str,
        max_attempts: int = 5,
        window_seconds: int = 60,
        *,
        scope: str = "login",
    ) -> None:
        """
        Records attempts in an atomic sliding window, isolated by scope and client key.
        Raises HTTP 429 when the configured attempt limit is exceeded.
        """
        clean_ip = ip.strip() if isinstance(ip, str) else "unknown"
        clean_ip = clean_ip if clean_ip and len(clean_ip) <= 64 else "unknown"
        if not isinstance(scope, str) or not re.fullmatch(r"[a-zA-Z0-9_-]{1,32}", scope):
            raise ValueError("Rate-limit scope is invalid.")
        if (
            max_attempts < 1
            or window_seconds < 1
            or window_seconds > RATE_LIMIT_MAX_WINDOW_SECONDS
        ):
            raise ValueError("Rate-limit settings are outside supported limits.")
        rate_limit_key = clean_ip if scope == "login" else f"{scope}:{clean_ip}"
        now = int(time.time())
        cutoff = now - window_seconds
        limited = False
        with self._lock:
            try:
                with self._get_connection() as conn:
                    conn.execute("BEGIN IMMEDIATE")
                    cleanup_time = time.monotonic()
                    cleanup_due = (
                        cleanup_time - self._last_rate_limit_cleanup_at
                        >= RATE_LIMIT_CLEANUP_INTERVAL_SECONDS
                    )
                    if cleanup_due:
                        conn.execute(
                            """
                            DELETE FROM login_rate_limits
                            WHERE id IN (
                                SELECT id
                                FROM login_rate_limits
                                WHERE attempt_time < ?
                                ORDER BY id
                                LIMIT ?
                            )
                            """,
                            (
                                now - RATE_LIMIT_MAX_WINDOW_SECONDS,
                                RATE_LIMIT_CLEANUP_BATCH_SIZE,
                            ),
                        )
                    conn.execute(
                        "DELETE FROM login_rate_limits WHERE ip = ? AND attempt_time < ?",
                        (rate_limit_key, cutoff),
                    )
                    cursor = conn.execute(
                        "SELECT COUNT(*) AS cnt FROM login_rate_limits WHERE ip = ? AND attempt_time >= ?",
                        (rate_limit_key, cutoff)
                    )
                    row = cursor.fetchone()
                    count = row["cnt"] if row else 0
                    if count >= max_attempts:
                        limited = True
                    else:
                        conn.execute(
                            "INSERT INTO login_rate_limits (ip, attempt_time) VALUES (?, ?)",
                            (rate_limit_key, now)
                        )
                    conn.commit()
                    if cleanup_due:
                        self._last_rate_limit_cleanup_at = cleanup_time
            except DB_ERROR_TYPES as exc:
                raise HTTPException(status_code=503, detail="Login service is temporarily unavailable.") from exc
        if limited:
            raise HTTPException(
                status_code=429,
                detail="Terlalu banyak percobaan masuk. Silakan coba lagi nanti.",
                headers={"Retry-After": str(window_seconds)}
            )

    def reset_rate_limits_for_ip(self, ip: str) -> None:
        """Helper untuk reset rate limit IP (misal saat automated testing)."""
        clean_ip = (ip or "127.0.0.1").strip() or "127.0.0.1"
        with self._lock:
            with self._get_connection() as conn:
                conn.execute("DELETE FROM login_rate_limits WHERE ip = ?", (clean_ip,))
                conn.commit()

    # =========================================================================
    # PERSISTENT USER MANAGEMENT & PROVISIONING
    # =========================================================================
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Mencari akun pengguna berdasarkan alamat email (case-insensitive)."""
        if not email or not isinstance(email, str):
            return None
        clean_email = email.strip().lower()
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
                row = cursor.fetchone()
                if row:
                    return dict(row)
                return None
        except DB_ERROR_TYPES as exc:
            raise HTTPException(status_code=503, detail="Account service is unavailable.") from exc

    def create_user(
        self,
        email: str,
        hashed_password: str,
        role: str = "student",
        name: str = "",
        subject_id: str = "",
        grade: str = "SMP Kelas VII",
        description: str = "",
        auth_provider: str = "local",
        is_provisioned_researcher: bool = False
    ) -> Dict[str, Any]:
        """Menyimpan pengguna baru secara persisten ke database (SQLite/PostgreSQL)."""
        clean_email = email.strip().lower()
        now = int(time.time())
        # Pastikan pendaftaran mandiri TIDAK PERNAH memperoleh role selain student
        if role not in ("student", "researcher"):
            raise ValueError("Unsupported user role.")
        if role == "researcher" and not is_provisioned_researcher:
            raise ValueError("Researcher accounts must be provisioned by an administrator.")
        actual_role = "researcher" if is_provisioned_researcher else "student"
        user_dict = {
            "email": clean_email,
            "hashed_password": hashed_password,
            "role": actual_role,
            "name": name or clean_email.split('@')[0],
            "subject_id": subject_id or f"U-{secrets.token_hex(8).upper()}",
            "grade": grade,
            "description": description or "Pengguna Mandiri Terdaftar",
            "auth_provider": auth_provider,
            "created_at": now,
            "is_provisioned_researcher": 1 if is_provisioned_researcher else 0
        }
        try:
            with self._lock:
                with self._get_connection() as conn:
                    conn.execute("""
                    INSERT INTO users (
                        email, hashed_password, role, name, subject_id, grade,
                        description, auth_provider, created_at, is_provisioned_researcher
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        user_dict["email"],
                        user_dict["hashed_password"],
                        user_dict["role"],
                        user_dict["name"],
                        user_dict["subject_id"],
                        user_dict["grade"],
                        user_dict["description"],
                        user_dict["auth_provider"],
                        user_dict["created_at"],
                        user_dict["is_provisioned_researcher"]
                    ))
                    conn.commit()
        except (sqlite3.IntegrityError, DatabaseIntegrityError) as exc:
            raise HTTPException(status_code=409, detail="An account with this email already exists.") from exc
        except DB_ERROR_TYPES as exc:
            raise HTTPException(status_code=503, detail="Account service is unavailable.") from exc
        return user_dict

    def provision_researcher(
        self,
        email: str,
        hashed_password: str,
        name: str = "Peneliti Matematika Terdaftar",
        subject_id: str = "P-001",
        grade: str = "Evaluator Pembelajaran",
        description: str = "Pengembang & Evaluator Desain Pembelajaran"
    ) -> Dict[str, Any]:
        """
        Mekanisme provisioning akun peneliti terotorisasi server-side.
        HANYA dipanggil melalui inisialisasi server atau administrasi internal yang sah.
        """
        existing = self.get_user_by_email(email)
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        return self.create_user(
            email=email,
            hashed_password=hashed_password,
            role="researcher",
            name=name,
            subject_id=subject_id,
            grade=grade,
            description=description,
            auth_provider="local",
            is_provisioned_researcher=True
        )

    def is_healthy(self) -> bool:
        try:
            with self._get_connection() as conn:
                cursor = conn.execute("SELECT COUNT(*) AS cnt FROM users")
                row = cursor.fetchone()
                return row is not None
        except Exception:
            return False


# Singleton instance
security_store = PersistentSecurityStore()
