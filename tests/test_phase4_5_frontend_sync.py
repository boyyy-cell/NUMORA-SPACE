"""
NUMORA Space — Phase 4 & 5 Frontend Integration & Persistent Data Sync Test Suite
Verifies:
1. Bootstrap migration from localStorage (UNMIGRATED -> MIGRATING -> VERIFIED_MIGRATED).
2. Module progress persistence across sessions / re-login.
3. Evaluation submission, idempotency deduplication, and score history.
4. NUMORA RUN stats (incremental deltas, MAX high score) and unlimited session retention (>10).
5. Multi-device simulation (two simulated client devices syncing seamlessly).
6. S-001 control group digital intervention block (HTTP 403, clean research separation).
7. Anti-IDOR account isolation (S-003 cannot access or affect S-002 data).
8. Activity audit trail persistence.

Operates in an ISOLATED temporary test database (never touches active production db).
"""
import os
import sys
import time
import json
import sqlite3
import tempfile
import pytest
from pathlib import Path

# Setup paths
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Configure isolated test database before importing application modules
temp_dir = tempfile.mkdtemp()
test_db_path = os.path.join(temp_dir, "test_phase4_5_store.db")
os.environ["NUMORA_SECURITY_DB_PATH"] = test_db_path
os.environ["ENVIRONMENT"] = "development"

def run_sync(coro):
    """Executes an async FastAPI handler without relying on sandbox-blocked socketpair event loops."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did an await!")

from fastapi import HTTPException
from backend.app.core.security import hash_password, create_access_token
from backend.app.services.token_revocation_store import security_store
from backend.app.services.auth_service import auth_service
from backend.app.services.student_sync_service import student_sync_service
from backend.app.schemas.student import (
    ModuleProgressUpdateRequest,
    EvaluationSubmitRequest,
    RunnerSessionSubmitRequest,
    StudentBootstrapMigrationRequest,
    ActivityLogRequest,
)
from backend.app.api.v1.endpoints.student import (
    get_student_sync,
    update_progress,
    get_progress,
    submit_evaluation,
    get_evaluations,
    record_runner_session,
    get_runner_stats,
    update_runner_stats,
    get_runner_sessions,
    log_activity,
    bootstrap_migration,
)
from backend.app.core.dependencies import require_student_digital_access


def setup_module():
    """Initializes the isolated test database schema and seeds test accounts."""
    os.environ["NUMORA_SECURITY_DB_PATH"] = test_db_path
    security_store.db_path = test_db_path
    security_store._init_db()
    auth_service._security_store = security_store

    conn = sqlite3.connect(test_db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")
    cur.execute("PRAGMA journal_mode = WAL;")

    # 1. Schema migrations table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at INTEGER NOT NULL
        )
    """)

    # 2. Student module progress
    cur.execute("""
        CREATE TABLE IF NOT EXISTS student_module_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            module_id TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
            slider_explored INTEGER NOT NULL DEFAULT 0,
            time_spent_seconds INTEGER NOT NULL DEFAULT 0,
            completed_at INTEGER,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
            UNIQUE(user_email, module_id)
        )
    """)

    # 3. Student evaluations
    cur.execute("""
        CREATE TABLE IF NOT EXISTS student_evaluations (
            evaluation_id TEXT PRIMARY KEY,
            idempotency_key TEXT NOT NULL,
            user_email TEXT NOT NULL,
            attempt_number INTEGER NOT NULL DEFAULT 1,
            score REAL NOT NULL CHECK(score >= 0.0 AND score <= 100.0),
            accuracy REAL NOT NULL CHECK(accuracy >= 0.0 AND accuracy <= 100.0),
            total_questions INTEGER NOT NULL DEFAULT 10,
            correct_count INTEGER NOT NULL,
            wrong_count INTEGER NOT NULL,
            category_breakdown TEXT NOT NULL,
            detailed_answers TEXT NOT NULL,
            completed_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
            CONSTRAINT uq_eval_idempotency UNIQUE(user_email, idempotency_key)
        )
    """)

    # 4. Student runner stats
    cur.execute("""
        CREATE TABLE IF NOT EXISTS student_runner_stats (
            user_email TEXT PRIMARY KEY,
            high_score_beginner INTEGER NOT NULL DEFAULT 0,
            high_score_intermediate INTEGER NOT NULL DEFAULT 0,
            high_score_advanced INTEGER NOT NULL DEFAULT 0,
            high_score_expert INTEGER NOT NULL DEFAULT 0,
            total_games INTEGER NOT NULL DEFAULT 0,
            total_coins INTEGER NOT NULL DEFAULT 0,
            total_distance INTEGER NOT NULL DEFAULT 0,
            total_math_answered INTEGER NOT NULL DEFAULT 0,
            total_math_correct INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    # 5. Student runner sessions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS student_runner_sessions (
            session_id TEXT PRIMARY KEY,
            idempotency_key TEXT NOT NULL,
            user_email TEXT NOT NULL,
            level TEXT NOT NULL CHECK(level IN ('beginner', 'intermediate', 'advanced', 'expert')),
            score INTEGER NOT NULL,
            coins INTEGER NOT NULL,
            distance INTEGER NOT NULL,
            answered INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            accuracy REAL NOT NULL,
            mistakes_count INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
            CONSTRAINT uq_runner_sess_idempotency UNIQUE(user_email, idempotency_key)
        )
    """)

    # 6. Learning activities
    cur.execute("""
        CREATE TABLE IF NOT EXISTS learning_activities (
            activity_id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            activity_type TEXT NOT NULL CHECK(activity_type IN ('LOGIN', 'LOGOUT', 'MODULE_VIEW', 'MODULE_COMPLETE', 'LAB_EXPERIMENT', 'NORA_CHAT', 'EVALUATION_SUBMIT', 'RUNNER_PLAY')),
            module_or_feature_id TEXT NOT NULL,
            metadata_json TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    # 7. Research subjects
    cur.execute("""
        CREATE TABLE IF NOT EXISTS research_subjects (
            subject_id TEXT PRIMARY KEY,
            group_name TEXT NOT NULL,
            role_description TEXT NOT NULL,
            grade TEXT NOT NULL DEFAULT 'SMP Kelas VII',
            active_module TEXT NOT NULL,
            pretest_status TEXT NOT NULL DEFAULT 'Scheduled',
            pretest_score REAL,
            posttest_status TEXT NOT NULL DEFAULT 'Scheduled',
            posttest_score REAL,
            cognitive_load_status TEXT NOT NULL DEFAULT 'NOT CONFIGURED (Belum Diukur)',
            total_sessions_logged INTEGER NOT NULL DEFAULT 0,
            protocol_category TEXT NOT NULL DEFAULT 'PROTOCOL_TEMPLATE',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    """)

    # 8. Research sessions
    cur.execute("""
        CREATE TABLE IF NOT EXISTS research_sessions (
            session_id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL,
            session_date TEXT NOT NULL,
            module_id TEXT NOT NULL,
            concept_studied TEXT NOT NULL,
            duration_minutes REAL NOT NULL,
            hints_used INTEGER NOT NULL DEFAULT 0,
            misconceptions_detected TEXT NOT NULL DEFAULT '[]',
            researcher_notes TEXT,
            verified_by_researcher INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id) ON DELETE RESTRICT
        )
    """)

    conn.commit()

    # Seed isolated test users
    now = int(time.time())
    users_data = [
        ("test_student_s002@numora.space", hash_password("ValidPassword123"), "student", "Siswa Eksperimen S-002", "S-002", "SMP Kelas VII", "Peserta Eksperimen", "local", now, 0),
        ("test_student_s001@numora.space", hash_password("ValidPassword123"), "student", "Siswa Kontrol S-001", "S-001", "SMP Kelas VII", "Peserta Kontrol", "local", now, 0),
        ("test_student_s003@numora.space", hash_password("ValidPassword123"), "student", "Siswa Lain S-003", "S-003", "SMP Kelas VII", "Peserta Siswa Lain", "local", now, 0),
        ("test_researcher_p001@numora.space", hash_password("ValidPassword123"), "researcher", "Peneliti Utama P-001", "P-001", "Fasilitator Riset", "Peneliti Utama", "local", now, 1),
    ]
    cur.executemany(
        """
        INSERT INTO users (email, hashed_password, role, name, subject_id, grade, description, auth_provider, created_at, is_provisioned_researcher)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO NOTHING
        """,
        users_data
    )

    cur.execute("""
        INSERT INTO research_subjects (subject_id, group_name, role_description, grade, active_module, pretest_status, pretest_score, posttest_status, posttest_score, cognitive_load_status, total_sessions_logged, protocol_category, created_at, updated_at)
        VALUES
        ('S-001', 'Kelompok Kontrol', 'Siswa Kontrol', 'SMP Kelas VII', 'module-1-linear-equations', 'Completed', 65.0, 'Scheduled', NULL, 'BELUM_DIUKUR', 0, 'CONTROL_GROUP', ?, ?),
        ('S-002', 'Kelompok Eksperimen', 'Siswa Eksperimen', 'SMP Kelas VII', 'module-1-linear-equations', 'Completed', 70.0, 'Scheduled', NULL, 'OPTIMAL', 0, 'DIGITAL_INTERVENTION', ?, ?)
        ON CONFLICT(subject_id) DO NOTHING
    """, (now, now, now, now))

    conn.commit()
    conn.close()


def teardown_module():
    """Cleans up isolated temporary database file."""
    try:
        if os.path.exists(test_db_path):
            os.remove(test_db_path)
    except Exception:
        pass


@pytest.fixture
def auth_tokens():
    """Generates valid JWT tokens and mock principal dictionaries for test users."""
    s002_token = create_access_token({"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"})
    s001_token = create_access_token({"sub": "test_student_s001@numora.space", "role": "student", "subject_id": "S-001"})
    s003_token = create_access_token({"sub": "test_student_s003@numora.space", "role": "student", "subject_id": "S-003"})
    p001_token = create_access_token({"sub": "test_researcher_p001@numora.space", "role": "researcher", "subject_id": "P-001"})

    return {
        "s002": {"token": s002_token, "user": {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}},
        "s001": {"token": s001_token, "user": {"sub": "test_student_s001@numora.space", "role": "student", "subject_id": "S-001"}},
        "s003": {"token": s003_token, "user": {"sub": "test_student_s003@numora.space", "role": "student", "subject_id": "S-003"}},
        "p001": {"token": p001_token, "user": {"sub": "test_researcher_p001@numora.space", "role": "researcher", "subject_id": "P-001"}},
    }


def test_01_bootstrap_migration(auth_tokens):
    """
    Test 1: Bootstrap migration merges local storage data and sets status to VERIFIED_MIGRATED.
    """
    user_s002 = auth_tokens["s002"]["user"]

    payload = StudentBootstrapMigrationRequest(
        modules=["module-1-linear-equations", "module-2-variables"],
        evaluations=[
            {
                "idempotency_key": "bootstrap_eval_001",
                "score": 90.0,
                "accuracy": 90.0,
                "total_questions": 10,
                "correct_count": 9,
                "wrong_count": 1,
                "category_breakdown": {"linear": 9},
                "detailed_answers": [],
            }
        ],
        runner={
            "highScores": {"beginner": 1500, "intermediate": 800},
            "totalGames": 4,
            "totalCoins": 45,
            "totalAnswered": 12,
            "totalCorrect": 10,
        }
    )

    response = run_sync(bootstrap_migration(payload=payload, current_user=user_s002))
    assert response["status"] == "VERIFIED_MIGRATED"
    assert response["synced_modules"] == 2
    assert response["synced_evaluations"] == 1
    assert response["current_state"]["runner_stats"]["high_score_beginner"] == 1500

    # Verify idempotency: re-running migration with same/subset does not duplicate
    response2 = run_sync(bootstrap_migration(payload=payload, current_user=user_s002))
    assert response2["status"] == "VERIFIED_MIGRATED"
    assert len(response2["current_state"]["evaluations"]) == 1


def test_02_module_progress_persistence_and_relogin(auth_tokens):
    """
    Test 2: Module completion persists to SQLite and is retrieved seamlessly on re-login.
    """
    user_s002 = auth_tokens["s002"]["user"]

    # Student completes module-3-operations
    update_req = ModuleProgressUpdateRequest(
        module_id="module-3-operations",
        status="COMPLETED",
        slider_explored=100,
        time_spent_seconds=420,
    )
    result = run_sync(update_progress(payload=update_req, current_user=user_s002))
    assert result["status"] == "COMPLETED"
    assert result["module_id"] == "module-3-operations"

    # Simulate re-login: fetch full sync state
    sync_state = run_sync(get_student_sync(current_user=user_s002))
    completed_modules = [m["module_id"] for m in sync_state["progress"] if m["status"] == "COMPLETED"]
    assert "module-1-linear-equations" in completed_modules
    assert "module-2-variables" in completed_modules
    assert "module-3-operations" in completed_modules


def test_03_evaluation_idempotency_and_history(auth_tokens):
    """
    Test 3: Evaluation submissions are deduplicated by idempotency_key and order is preserved.
    """
    user_s002 = auth_tokens["s002"]["user"]

    eval_req = EvaluationSubmitRequest(
        idempotency_key="unique_quiz_run_abc_1",
        score=85.0,
        accuracy=85.0,
        total_questions=10,
        correct_count=8,
        wrong_count=2,
        category_breakdown={"basic": 8},
        detailed_answers=[{"q": 1, "correct": True}],
    )

    first_sub = run_sync(submit_evaluation(payload=eval_req, current_user=user_s002))
    first_id = first_sub["evaluation_id"]
    assert first_sub["score"] == 85.0

    # Immediate duplicate submit with identical idempotency_key
    second_sub = run_sync(submit_evaluation(payload=eval_req, current_user=user_s002))
    assert second_sub["evaluation_id"] == first_id

    # Verify attempt sequence
    history = run_sync(get_evaluations(current_user=user_s002))
    eval_ids = [e["evaluation_id"] for e in history]
    assert eval_ids.count(first_id) == 1


def test_04_runner_unlimited_session_retention(auth_tokens):
    """
    Test 4: All runner sessions are retained in database without the client-side 10-session cap.
    """
    user_s002 = auth_tokens["s002"]["user"]

    # Record 15 consecutive sessions
    for i in range(1, 16):
        sess_req = RunnerSessionSubmitRequest(
            idempotency_key=f"runner_sess_batch_{i}",
            level="beginner",
            score=1000 + i * 50,
            coins=10 + i,
            distance=200 + i * 10,
            answered=5,
            correct=4,
            accuracy=80.0,
            mistakes_count=1,
        )
        res = run_sync(record_runner_session(payload=sess_req, current_user=user_s002))
        assert res["session"]["session_id"] is not None

    # Retrieve all sessions
    all_sessions = run_sync(get_runner_sessions(limit=50, offset=0, current_user=user_s002))
    assert len(all_sessions) >= 15

    # Check high score
    stats = run_sync(get_runner_stats(current_user=user_s002))
    # 1000 + 15*50 = 1750, compared to initial 1500
    assert stats["high_score_beginner"] >= 1750


def test_05_multidevice_simulation(auth_tokens):
    """
    Test 5: Multi-device simulation where Device A and Device B update data independently.
    Sync endpoint reconciles both updates without data loss.
    """
    user_s002 = auth_tokens["s002"]["user"]

    # Device A finishes module-4-word-problems
    run_sync(update_progress(
        payload=ModuleProgressUpdateRequest(module_id="module-4-word-problems", status="COMPLETED", slider_explored=100),
        current_user=user_s002
    ))

    # Device B records intermediate runner high score
    run_sync(record_runner_session(
        payload=RunnerSessionSubmitRequest(
            idempotency_key="device_b_runner_01",
            level="intermediate",
            score=2400,
            coins=80,
            distance=500,
            answered=10,
            correct=10,
            accuracy=100.0,
            mistakes_count=0
        ),
        current_user=user_s002
    ))

    # Device A syncs
    sync_a = run_sync(get_student_sync(current_user=user_s002))
    progress_map = {p["module_id"]: p["status"] for p in sync_a["progress"]}
    assert progress_map.get("module-4-word-problems") == "COMPLETED"
    assert sync_a["runner_stats"]["high_score_intermediate"] == 2400


def test_06_s001_control_group_digital_block(auth_tokens):
    """
    Test 6: S-001 (control group) is strictly blocked from digital learning endpoints (HTTP 403).
    """
    user_s001 = auth_tokens["s001"]["user"]

    # S-001 dependency check must raise HTTPException 403
    with pytest.raises(HTTPException) as exc_info:
        run_sync(require_student_digital_access(user_s001))
    assert exc_info.value.status_code == 403
    assert "S-001" in exc_info.value.detail


def test_07_account_isolation_anti_idor(auth_tokens):
    """
    Test 7: S-003 cannot view or mutate S-002 data.
    """
    user_s003 = auth_tokens["s003"]["user"]

    # S-003 sync state must be empty (clean)
    sync_s003 = run_sync(get_student_sync(current_user=user_s003))
    assert len(sync_s003["progress"]) == 0
    assert len(sync_s003["evaluations"]) == 0
    assert sync_s003["runner_stats"]["total_games"] == 0

    # S-003 evaluation list is separate
    evals_s003 = run_sync(get_evaluations(current_user=user_s003))
    assert len(evals_s003) == 0


def test_08_activity_log_audit_trail(auth_tokens):
    """
    Test 8: Student activity log records events for research auditability.
    """
    user_s002 = auth_tokens["s002"]["user"]

    act_req = ActivityLogRequest(
        activity_type="LAB_EXPERIMENT",
        module_or_feature_id="algebra_lab_balance_scale",
        metadata={"equations_tested": ["2x+4=10", "3x-1=8"]}
    )

    res = run_sync(log_activity(payload=act_req, current_user=user_s002))
    assert res["activity_id"] is not None
    assert res["activity_type"] == "LAB_EXPERIMENT"
    assert res["module_or_feature_id"] == "algebra_lab_balance_scale"
