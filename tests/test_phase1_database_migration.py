"""
TEST SUITE: PHASE 1 ADDITIVE DATABASE SCHEMA MIGRATION VALIDATION
Verifies schema, WAL configuration, foreign keys, unique constraints, and data preservation.
"""
import pytest
import sqlite3
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "backend" / "app" / "data" / "security_store.db"
BACKUP_DIR = BASE_DIR / "backend" / "app" / "data" / "backups"
PHASE0_BACKUP = BACKUP_DIR / "security_store_backup_20261123_092957.db"


@pytest.fixture
def db_conn():
    conn = sqlite3.connect(str(DB_PATH), timeout=15.0, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 15000")
    yield conn
    conn.close()


def test_database_integrity_and_pragmas(db_conn):
    # 1. Integrity check
    res = db_conn.execute("PRAGMA integrity_check").fetchone()[0]
    assert res == "ok", f"Integrity check failed: {res}"

    # 2. Journal mode WAL
    mode = db_conn.execute("PRAGMA journal_mode").fetchone()[0]
    assert mode.lower() == "wal", f"Journal mode is not WAL: {mode}"

    # 3. Foreign keys enabled
    fk = db_conn.execute("PRAGMA foreign_keys").fetchone()[0]
    assert fk == 1, f"Foreign keys not enabled: {fk}"


def test_all_expected_tables_exist(db_conn):
    expected_tables = {
        "users",
        "revoked_tokens",
        "login_rate_limits",
        "schema_migrations",
        "student_module_progress",
        "student_evaluations",
        "student_runner_stats",
        "student_runner_sessions",
        "learning_activities",
        "research_subjects",
        "research_sessions",
        "research_cognitive_load_records",
    }
    rows = db_conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).fetchall()
    actual_tables = {r["name"] for r in rows}
    
    missing = expected_tables - actual_tables
    assert not missing, f"Missing tables in database: {missing}"


def test_original_accounts_and_data_preserved(db_conn):
    # Verify exact 4 accounts
    users = db_conn.execute("SELECT email, role, subject_id, is_provisioned_researcher FROM users ORDER BY email").fetchall()
    assert len(users) == 4, f"Expected 4 accounts, found {len(users)}"

    users_map = {u["email"]: u for u in users}
    
    # Check S-002
    assert "siswa.demo@numora.space" in users_map
    s002 = users_map["siswa.demo@numora.space"]
    assert s002["role"] == "student"
    assert s002["subject_id"] == "S-002"
    assert s002["is_provisioned_researcher"] == 0

    # Check P-001
    assert "peneliti.demo@numora.space" in users_map
    p001 = users_map["peneliti.demo@numora.space"]
    assert p001["role"] == "researcher"
    assert p001["subject_id"] == "P-001"
    assert p001["is_provisioned_researcher"] == 1

    # Check public accounts
    assert "faridsyahputra53@gmail.com" in users_map
    assert "popolkupa123@gmail.com" in users_map

    # Verify counts in old tables
    revoked_count = db_conn.execute("SELECT COUNT(*) FROM revoked_tokens").fetchone()[0]
    assert revoked_count == 14, f"Revoked tokens count mismatch: {revoked_count}"

    rate_limits_count = db_conn.execute("SELECT COUNT(*) FROM login_rate_limits").fetchone()[0]
    assert rate_limits_count == 6, f"Rate limits count mismatch: {rate_limits_count}"


def test_research_subjects_initial_seed(db_conn):
    rows = db_conn.execute("SELECT subject_id, group_name, protocol_category FROM research_subjects ORDER BY subject_id").fetchall()
    assert len(rows) == 2, f"Expected exactly 2 research subjects (S-001 & S-002), found {len(rows)}"
    
    s001 = rows[0]
    assert s001["subject_id"] == "S-001"
    assert "Control" in s001["group_name"]
    
    s002 = rows[1]
    assert s002["subject_id"] == "S-002"
    assert "Experimental" in s002["group_name"]


def test_foreign_key_constraints_enforced(db_conn):
    # 1. Invalid email in student_module_progress
    with pytest.raises(sqlite3.IntegrityError):
        db_conn.execute("""
            INSERT INTO student_module_progress (user_email, module_id, status, updated_at)
            VALUES ('nonexistent.user@invalid.test', 'MOD-01', 'completed', 1000)
        """)

    # 2. Invalid email in student_evaluations
    with pytest.raises(sqlite3.IntegrityError):
        db_conn.execute("""
            INSERT INTO student_evaluations (
                evaluation_id, idempotency_key, user_email, attempt_number,
                score, accuracy, total_questions, correct_count, wrong_count,
                category_breakdown, detailed_answers, completed_at
            ) VALUES (
                'test-err-id', 'test-err-key', 'nonexistent.user@invalid.test', 1,
                100.0, 1.0, 10, 10, 0, '{}', '[]', 1000
            )
        """)

    # 3. Invalid subject_id in research_sessions
    with pytest.raises(sqlite3.IntegrityError):
        db_conn.execute("""
            INSERT INTO research_sessions (
                session_id, subject_id, session_date, module_id, concept_studied,
                duration_minutes, created_at
            ) VALUES (
                'test-sess-err', 'S-999-NONEXISTENT', '2026-11-23', 'MOD-01', 'test',
                30.0, 1000
            )
        """)


def test_unique_constraints_and_idempotency(db_conn):
    user_email = "siswa.demo@numora.space"
    now_ts = int(time.time())

    # 1. Test UNIQUE(user_email, module_id)
    db_conn.execute("BEGIN IMMEDIATE")
    try:
        db_conn.execute("""
            INSERT INTO student_module_progress (user_email, module_id, status, updated_at)
            VALUES (?, 'MOD-TEST-UNIQ', 'completed', ?)
        """, (user_email, now_ts))

        # Duplicate must fail
        with pytest.raises(sqlite3.IntegrityError):
            db_conn.execute("""
                INSERT INTO student_module_progress (user_email, module_id, status, updated_at)
                VALUES (?, 'MOD-TEST-UNIQ', 'completed', ?)
            """, (user_email, now_ts))
    finally:
        db_conn.execute("ROLLBACK")

    # 2. Test UNIQUE(user_email, idempotency_key) in student_evaluations
    db_conn.execute("BEGIN IMMEDIATE")
    try:
        idem_key = f"idem-key-{now_ts}"
        db_conn.execute("""
            INSERT INTO student_evaluations (
                evaluation_id, idempotency_key, user_email, attempt_number,
                score, accuracy, total_questions, correct_count, wrong_count,
                category_breakdown, detailed_answers, completed_at
            ) VALUES (
                'eval-test-u1', ?, ?, 1, 100.0, 1.0, 10, 10, 0, '{}', '[]', ?
            )
        """, (idem_key, user_email, now_ts))

        # Duplicate idempotency_key must fail
        with pytest.raises(sqlite3.IntegrityError):
            db_conn.execute("""
                INSERT INTO student_evaluations (
                    evaluation_id, idempotency_key, user_email, attempt_number,
                    score, accuracy, total_questions, correct_count, wrong_count,
                    category_breakdown, detailed_answers, completed_at
                ) VALUES (
                    'eval-test-u2', ?, ?, 2, 80.0, 0.8, 10, 8, 2, '{}', '[]', ?
                )
            """, (idem_key, user_email, now_ts))
    finally:
        db_conn.execute("ROLLBACK")


def test_phase0_backup_remains_valid():
    assert PHASE0_BACKUP.exists(), "Phase 0 backup missing!"
    conn = sqlite3.connect(f"file:{PHASE0_BACKUP.resolve().as_posix()}?mode=ro", uri=True)
    res = conn.execute("PRAGMA integrity_check").fetchone()[0]
    conn.close()
    assert res == "ok", f"Phase 0 backup corrupted: {res}"
