"""
NUMORA Space — Unified Database Engine & Multi-Dialect Connection Provider
Provides enterprise-grade dual-mode persistence:
- Local SQLite (thread-safe, WAL mode, foreign keys, busy timeout) for zero-dependency development.
- Managed PostgreSQL (Neon / Supabase / AWS RDS / Cloud Run) with connection pooling for production.
- Automatic query placeholder translation ('?' -> '%s') and unified dict-like row access.
"""
import os
import re
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Optional, Any, Sequence, Dict, Tuple, Union

# Attempt to import psycopg for PostgreSQL support (optional in local dev, required for PostgreSQL)
try:
    import psycopg
    from psycopg import errors as pg_errors
    from psycopg.rows import dict_row
    try:
        from psycopg_pool import ConnectionPool
    except ImportError:
        ConnectionPool = None
    HAS_PSYCOPG = True
except ImportError:
    psycopg = None
    pg_errors = None
    dict_row = None
    ConnectionPool = None
    HAS_PSYCOPG = False


# Unified exception types for error handling
class DatabaseIntegrityError(Exception):
    """Raised on unique constraint or foreign key violations across dialects."""
    pass


class DatabaseServiceUnavailableError(Exception):
    """Raised when the database backend is unreachable or connection fails."""
    pass


# Specific database error tuple for precise exception handling without catching generic application bugs
DB_ERROR_TYPES: Tuple[type, ...] = (sqlite3.Error, DatabaseIntegrityError, DatabaseServiceUnavailableError)
if pg_errors is not None and hasattr(pg_errors, "Error"):
    DB_ERROR_TYPES = DB_ERROR_TYPES + (pg_errors.Error,)
if psycopg is not None and hasattr(psycopg, "Error"):
    DB_ERROR_TYPES = DB_ERROR_TYPES + (psycopg.Error,)


def get_default_sqlite_path() -> str:
    env_path = os.environ.get("NUMORA_SECURITY_DB_PATH")
    if env_path:
        return env_path
    base_dir = Path(__file__).resolve().parent.parent
    return str(base_dir / "data" / "security_store.db")


def normalize_database_url(url: Optional[str]) -> Optional[str]:
    """
    Normalizes database connection URL for PostgreSQL:
    - Replaces 'postgres://' with 'postgresql://' (required by modern drivers).
    - Ensures 'sslmode=require' for remote cloud providers like Neon if not specified.
    """
    if not url or not isinstance(url, str):
        return None
    trimmed = url.strip()
    if not (trimmed.startswith("postgresql://") or trimmed.startswith("postgres://")):
        return None

    if trimmed.startswith("postgres://"):
        trimmed = "postgresql://" + trimmed[len("postgres://"):]

    # Add sslmode=require for cloud providers (like neon.tech) if not on localhost
    if "neon.tech" in trimmed or "supabase.co" in trimmed:
        if "sslmode=" not in trimmed:
            separator = "&" if "?" in trimmed else "?"
            trimmed = f"{trimmed}{separator}sslmode=require"

    return trimmed


def is_postgres_configured() -> bool:
    """Returns True if DATABASE_URL points to a PostgreSQL database."""
    url = normalize_database_url(os.environ.get("DATABASE_URL"))
    return bool(url and (url.startswith("postgresql://") or url.startswith("postgres://")))


def convert_placeholders(sql: str) -> str:
    """
    Translates SQLite '?' parameter placeholders to PostgreSQL '%s' placeholders,
    preserving question marks that appear inside single- or double-quoted string literals.
    """
    result = []
    in_single_quote = False
    in_double_quote = False
    escape = False

    for char in sql:
        if escape:
            result.append(char)
            escape = False
            continue

        if char == "\\":
            escape = True
            result.append(char)
            continue

        if char == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
            result.append(char)
        elif char == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
            result.append(char)
        elif char == '?' and not in_single_quote and not in_double_quote:
            result.append('%s')
        else:
            result.append(char)

    return "".join(result)


def adapt_postgres_syntax(sql: str) -> str:
    """
    Translates dialect differences between SQLite and PostgreSQL:
    1. Converts scalar multi-argument MAX(a, b) -> GREATEST(a, b) (PostgreSQL uses GREATEST for scalar max).
    2. Converts parameter placeholders '?' -> '%s', safely ignoring string literals.
    """
    # Convert multi-argument scalar MAX to GREATEST
    sql = re.sub(r'\bMAX\s*\(\s*([^()]+?,[^()]+?)\s*\)', r'GREATEST(\1)', sql, flags=re.IGNORECASE)
    # Convert parameter placeholders
    return convert_placeholders(sql)


# =============================================================================
# CURSOR & CONNECTION PROXIES (UNIFIED DICT-LIKE ROW & DIALECT ABSTRACTION)
# =============================================================================

class CursorProxy:
    """Wraps cursor to provide unified dict-like access and rowcount."""
    def __init__(self, raw_cursor, is_postgres: bool = False):
        self._cursor = raw_cursor
        self._is_postgres = is_postgres

    def fetchone(self) -> Optional[Dict[str, Any]]:
        row = self._cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self) -> list:
        rows = self._cursor.fetchall()
        return [dict(r) for r in rows]

    @property
    def rowcount(self) -> int:
        return self._cursor.rowcount

    def __iter__(self):
        for row in self._cursor:
            yield dict(row)


class ConnectionProxy:
    """
    Wraps both SQLite and PostgreSQL connections to provide unified:
    - .execute(sql, params) with automatic placeholder conversion for PostgreSQL.
    - .commit() / .rollback()
    - Row dictionary access via CursorProxy.
    """
    def __init__(self, raw_conn, is_postgres: bool = False):
        self._conn = raw_conn
        self._is_postgres = is_postgres

    @property
    def raw_connection(self):
        return self._conn

    @property
    def is_postgres(self) -> bool:
        return self._is_postgres

    def execute(self, sql: str, params: Optional[Sequence[Any]] = None) -> CursorProxy:
        if self._is_postgres:
            stripped_upper = sql.strip().upper() 
            # Handle SQLite-specific PRAGMA and BEGIN IMMEDIATE
            if stripped_upper.startswith("PRAGMA"):
                # Pragma statements are SQLite-specific no-ops in PostgreSQL
                cur = self._conn.cursor()
                return CursorProxy(cur, is_postgres=True)
            if stripped_upper in ("BEGIN IMMEDIATE", "BEGIN"):
                try:
                    cur = self._conn.cursor()
                    cur.execute("BEGIN")
                    return CursorProxy(cur, is_postgres=True)
                except Exception as exc:
                    if pg_errors and isinstance(exc, (pg_errors.ActiveSqlTransaction,)):
                        cur = self._conn.cursor()
                        return CursorProxy(cur, is_postgres=True)
                    raise

            adapted_sql = adapt_postgres_syntax(sql)
            try:
                cur = self._conn.cursor()
                if params is not None:
                    cur.execute(adapted_sql, params)
                else:
                    cur.execute(adapted_sql)
                return CursorProxy(cur, is_postgres=True)
            except Exception as exc:
                if pg_errors and isinstance(exc, (pg_errors.IntegrityError, pg_errors.UniqueViolation, pg_errors.ForeignKeyViolation)):
                    raise DatabaseIntegrityError(str(exc)) from exc
                raise
        else:
            try:
                if params is not None:
                    cur = self._conn.execute(sql, params)
                else:
                    cur = self._conn.execute(sql)
                return CursorProxy(cur, is_postgres=False)
            except sqlite3.IntegrityError as exc:
                raise DatabaseIntegrityError(str(exc)) from exc

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()


# =============================================================================
# CONNECTION POOL & FACTORY
# =============================================================================

class DatabaseManager:
    """
    Thread-safe database manager supporting connection pooling for PostgreSQL (Neon)
    and per-thread or isolated connections for SQLite.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._pg_pool = None
        self._initialized_url = None

    def _get_pg_pool(self, url: str):
        if not HAS_PSYCOPG:
            raise RuntimeError(
                "DATABASE_URL is configured for PostgreSQL, but 'psycopg' is not installed. "
                "Please install psycopg[binary,pool]>=3.1.18 to use PostgreSQL/Neon."
            )
        with self._lock:
            if self._pg_pool is None or self._initialized_url != url:
                if ConnectionPool is not None:
                    self._pg_pool = ConnectionPool(
                        conninfo=url,
                        min_size=1,
                        max_size=10,
                        timeout=15.0,
                        kwargs={"row_factory": dict_row}
                    )
                else:
                    self._pg_pool = None
                self._initialized_url = url
            return self._pg_pool

    @contextmanager
    def get_connection(self, db_path: Optional[str] = None) -> Iterator[ConnectionProxy]:
        """
        Returns a ConnectionProxy for either PostgreSQL or SQLite:
        - If db_path is explicitly specified (e.g. in test fixtures or ':memory:'), uses SQLite with that path.
        - Otherwise, if DATABASE_URL is set for PostgreSQL, checks out a pooled PostgreSQL connection.
        - Otherwise, connects to default local SQLite database.
        """
        # Explicit db_path takes precedence (allows isolated SQLite testing)
        if db_path is not None:
            if db_path != ":memory:":
                Path(db_path).parent.mkdir(parents=True, exist_ok=True)
            conn = sqlite3.connect(db_path, timeout=15.0, isolation_level=None)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON")
            conn.execute("PRAGMA busy_timeout = 15000")
            try:
                yield ConnectionProxy(conn, is_postgres=False)
            finally:
                conn.close()
            return

        # Check if PostgreSQL is configured via DATABASE_URL
        pg_url = normalize_database_url(os.environ.get("DATABASE_URL"))
        if pg_url:
            pool = self._get_pg_pool(pg_url)
            if pool is not None:
                with pool.connection() as raw_conn:
                    yield ConnectionProxy(raw_conn, is_postgres=True)
            else:
                # Direct psycopg connection fallback if pool is unavailable
                raw_conn = psycopg.connect(pg_url, row_factory=dict_row)
                try:
                    yield ConnectionProxy(raw_conn, is_postgres=True)
                finally:
                    raw_conn.close()
            return

        # Default SQLite fallback
        sqlite_path = get_default_sqlite_path()
        if sqlite_path != ":memory:":
            Path(sqlite_path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(sqlite_path, timeout=15.0, isolation_level=None)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA busy_timeout = 15000")
        try:
            yield ConnectionProxy(conn, is_postgres=False)
        finally:
            conn.close()

    @contextmanager
    def transaction(self, db_path: Optional[str] = None) -> Iterator[ConnectionProxy]:
        """
        Transactional context manager:
        - SQLite: executes BEGIN IMMEDIATE, commits on success, rollbacks on error.
        - PostgreSQL: commits on success, rollbacks on error.
        """
        with self.get_connection(db_path=db_path) as conn:
            if conn.is_postgres:
                try:
                    yield conn
                    conn.commit()
                except Exception:
                    conn.rollback()
                    raise
            else:
                conn.execute("BEGIN IMMEDIATE")
                try:
                    yield conn
                    conn.execute("COMMIT")
                except Exception:
                    conn.execute("ROLLBACK")
                    raise


# Global singleton database manager
db_manager = DatabaseManager()


# =============================================================================
# POSTGRESQL DDL SCHEMA DEFINITIONS (IDEMPOTENT & PRODUCTION READY)
# =============================================================================

POSTGRES_SCHEMA_SQL = """
-- 1. Users Table
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
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subject ON users(subject_id);

-- 2. Revoked Tokens Table
CREATE TABLE IF NOT EXISTS revoked_tokens (
    jti VARCHAR(255) PRIMARY KEY,
    expires_at BIGINT NOT NULL,
    revoked_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires ON revoked_tokens(expires_at);

-- 3. Rate Limits Table
CREATE TABLE IF NOT EXISTS login_rate_limits (
    id BIGSERIAL PRIMARY KEY,
    ip VARCHAR(128) NOT NULL,
    attempt_time BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_time ON login_rate_limits(ip, attempt_time);

-- 4. Schema Migrations Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at BIGINT NOT NULL
);

-- 5. Research Subjects Table
CREATE TABLE IF NOT EXISTS research_subjects (
    subject_id VARCHAR(50) PRIMARY KEY,
    group_name TEXT NOT NULL,
    role_description TEXT NOT NULL,
    grade VARCHAR(100) NOT NULL DEFAULT 'SMP Kelas VII',
    active_module VARCHAR(255) NOT NULL,
    pretest_status VARCHAR(100) NOT NULL DEFAULT 'Scheduled',
    pretest_score DOUBLE PRECISION,
    posttest_status VARCHAR(100) NOT NULL DEFAULT 'Scheduled',
    posttest_score DOUBLE PRECISION,
    cognitive_load_status VARCHAR(255) NOT NULL DEFAULT 'NOT CONFIGURED (Belum Diukur)',
    total_sessions_logged INTEGER NOT NULL DEFAULT 0,
    protocol_category VARCHAR(100) NOT NULL DEFAULT 'PROTOCOL_TEMPLATE',
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

-- 6. Student Module Progress Table
CREATE TABLE IF NOT EXISTS student_module_progress (
    id BIGSERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    slider_explored INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    completed_at BIGINT,
    updated_at BIGINT NOT NULL,
    CONSTRAINT uq_mod_prog_user_mod UNIQUE(user_email, module_id),
    CONSTRAINT fk_mod_prog_user FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_mod_progress_email ON student_module_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_mod_progress_status ON student_module_progress(status);

-- 7. Student Evaluations Table
CREATE TABLE IF NOT EXISTS student_evaluations (
    evaluation_id VARCHAR(255) PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    score DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 10,
    correct_count INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL,
    category_breakdown TEXT NOT NULL,
    detailed_answers TEXT NOT NULL,
    completed_at BIGINT NOT NULL,
    CONSTRAINT uq_eval_idempotency UNIQUE(user_email, idempotency_key),
    CONSTRAINT fk_eval_user FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_eval_user_time ON student_evaluations(user_email, completed_at DESC);

-- 8. Student Runner Stats Table
CREATE TABLE IF NOT EXISTS student_runner_stats (
    user_email VARCHAR(255) PRIMARY KEY,
    high_score_beginner INTEGER NOT NULL DEFAULT 0,
    high_score_intermediate INTEGER NOT NULL DEFAULT 0,
    high_score_advanced INTEGER NOT NULL DEFAULT 0,
    high_score_expert INTEGER NOT NULL DEFAULT 0,
    total_games INTEGER NOT NULL DEFAULT 0,
    total_coins INTEGER NOT NULL DEFAULT 0,
    total_distance INTEGER NOT NULL DEFAULT 0,
    total_math_answered INTEGER NOT NULL DEFAULT 0,
    total_math_correct INTEGER NOT NULL DEFAULT 0,
    updated_at BIGINT NOT NULL,
    CONSTRAINT fk_runner_stats_user FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- 9. Student Runner Sessions Table
CREATE TABLE IF NOT EXISTS student_runner_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    coins INTEGER NOT NULL,
    distance INTEGER NOT NULL,
    answered INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    mistakes_count INTEGER NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL,
    CONSTRAINT uq_runner_sess_idempotency UNIQUE(user_email, idempotency_key),
    CONSTRAINT fk_runner_sess_user FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_runner_sess_email ON student_runner_sessions(user_email, created_at DESC);

-- 10. Learning Activities Table
CREATE TABLE IF NOT EXISTS learning_activities (
    activity_id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    module_or_feature_id VARCHAR(255) NOT NULL,
    metadata_json TEXT,
    created_at BIGINT NOT NULL,
    CONSTRAINT fk_act_user FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_activities_user_type ON learning_activities(user_email, activity_type, created_at DESC);

-- 11. Research Sessions Table
CREATE TABLE IF NOT EXISTS research_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL,
    session_date VARCHAR(50) NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    concept_studied VARCHAR(255) NOT NULL,
    duration_minutes DOUBLE PRECISION NOT NULL,
    hints_used INTEGER NOT NULL DEFAULT 0,
    misconceptions_detected TEXT NOT NULL DEFAULT '[]',
    researcher_notes TEXT,
    verified_by_researcher INTEGER NOT NULL DEFAULT 1,
    created_at BIGINT NOT NULL,
    CONSTRAINT fk_res_sess_subject FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_res_sess_subject ON research_sessions(subject_id, session_date);

-- 12. Research Cognitive Load Records Table
CREATE TABLE IF NOT EXISTS research_cognitive_load_records (
    record_id VARCHAR(255) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(255),
    framework_name VARCHAR(255) NOT NULL DEFAULT 'Leppink et al. Multidimensional Cognitive Load Scale',
    intrinsic_load DOUBLE PRECISION,
    extraneous_load DOUBLE PRECISION,
    germane_load DOUBLE PRECISION,
    instrument_status VARCHAR(255) NOT NULL,
    measured_at BIGINT NOT NULL,
    CONSTRAINT fk_cog_subject FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id) ON DELETE RESTRICT,
    CONSTRAINT fk_cog_session FOREIGN KEY (session_id) REFERENCES research_sessions(session_id) ON DELETE SET NULL
);
"""
