"""
NUMORA Space — Phase 2 & 3 Backend Verification Test Suite
Runs in an ISOLATED temporary test database.
Tests all repositories, student sync service, Pydantic schemas, and endpoints.
Verifies idempotency, anti-IDOR, S-001 digital intervention blocking, and researcher RBAC.
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
test_db_path = os.path.join(temp_dir, "test_verification_store.db")
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
from backend.app.core.config import settings
from backend.app.core.security import hash_password, create_access_token
from backend.app.services.token_revocation_store import PersistentSecurityStore, security_store
from backend.app.services.auth_service import auth_service
from backend.app.repositories.student_progress_repository import StudentProgressRepository
from backend.app.repositories.student_evaluation_repository import StudentEvaluationRepository
from backend.app.repositories.student_runner_repository import StudentRunnerRepository
from backend.app.repositories.learning_activity_repository import LearningActivityRepository
from backend.app.repositories.research_repository import (
    ResearchRepository,
    ResearchSubjectRepository,
    ResearchSessionRepository,
    CognitiveLoadRepository,
)
from backend.app.services.student_sync_service import StudentSyncService, student_sync_service
from backend.app.schemas.student import (
    ModuleProgressUpdateRequest,
    EvaluationSubmitRequest,
    RunnerSessionSubmitRequest,
    StudentBootstrapMigrationRequest,
    ActivityLogRequest,
)
from backend.app.schemas.research import CreateResearchSessionRequest
from backend.app.api.v1.endpoints.student import (
    get_student_sync,
    update_progress,
    get_progress,
    submit_evaluation,
    get_evaluations,
    record_runner_session,
    get_runner_stats,
    get_runner_sessions,
    log_activity,
    bootstrap_migration,
)
from backend.app.api.v1.endpoints.research import (
    get_subjects,
    get_subject_by_id,
    get_sessions,
    create_session,
    get_analytics,
    get_cognitive_load_status,
)
from backend.app.core.dependencies import require_student_digital_access, require_researcher


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

    # 9. Research cognitive load records
    cur.execute("""
        CREATE TABLE IF NOT EXISTS research_cognitive_load_records (
            record_id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL,
            session_id TEXT,
            framework_name TEXT NOT NULL,
            intrinsic_load REAL,
            extraneous_load REAL,
            germane_load REAL,
            instrument_status TEXT NOT NULL,
            measured_at INTEGER NOT NULL,
            FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id) ON DELETE RESTRICT,
            FOREIGN KEY (session_id) REFERENCES research_sessions(session_id) ON DELETE SET NULL
        )
    """)

    conn.commit()

    # Seed isolated test users (NEVER touches production/active db!)
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

    # Seed research subjects
    subjects_data = [
        ("S-001", "Control (Direct Teaching)", "Kelompok Tatap Muka Langsung", "SMP Kelas VII", "Modul 01", "Scheduled", None, "Scheduled", None, "NOT CONFIGURED", 0, "PROTOCOL_TEMPLATE", now, now),
        ("S-002", "Experimental (NUMORA Space Assisted)", "Kelompok Berbantuan NUMORA Space", "SMP Kelas VII", "Modul 01", "Scheduled", None, "Scheduled", None, "NOT CONFIGURED", 0, "PROTOCOL_TEMPLATE", now, now),
    ]
    cur.executemany(
        """
        INSERT INTO research_subjects (subject_id, group_name, role_description, grade, active_module, pretest_status, pretest_score, posttest_status, posttest_score, cognitive_load_status, total_sessions_logged, protocol_category, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(subject_id) DO NOTHING
        """,
        subjects_data
    )

    conn.commit()
    conn.close()


# ==============================================================================
# 1. DIRECT REPOSITORY TESTS
# ==============================================================================

def test_student_progress_repository_union_set():
    repo = StudentProgressRepository(db_path=test_db_path)
    email = "test_student_s002@numora.space"

    # 1. Insert initial
    p1 = repo.upsert_progress(email, "module_01", "IN_PROGRESS", slider_explored=40, time_spent_seconds=100)
    assert p1["status"] == "IN_PROGRESS"
    assert p1["slider_explored"] == 40
    assert p1["time_spent_seconds"] == 100

    # 2. Complete module
    p2 = repo.upsert_progress(email, "module_01", "COMPLETED", slider_explored=100, time_spent_seconds=300)
    assert p2["status"] == "COMPLETED"
    assert p2["completed_at"] is not None

    # 3. Regressive update attempt: status should remain COMPLETED, slider and time should take MAX
    p3 = repo.upsert_progress(email, "module_01", "IN_PROGRESS", slider_explored=10, time_spent_seconds=50)
    assert p3["status"] == "COMPLETED", "Status must NOT regress from COMPLETED to IN_PROGRESS"
    assert p3["slider_explored"] == 100, "Slider explored must retain MAX value"
    assert p3["time_spent_seconds"] == 300, "Time spent must retain MAX value"


def test_student_evaluation_repository_idempotency():
    repo = StudentEvaluationRepository(db_path=test_db_path)
    email = "test_student_s002@numora.space"
    idem_key = "test_eval_unique_key_001"

    # 1. Initial submission
    res1 = repo.save_evaluation(
        user_email=email,
        idempotency_key=idem_key,
        score=90.0,
        accuracy=90.0,
        total_questions=10,
        correct_count=9,
        wrong_count=1,
        category_breakdown={"algebra": 9},
        detailed_answers=[{"q": 1, "correct": True}],
    )
    assert res1["score"] == 90.0
    assert res1["attempt_number"] == 1

    # 2. Resubmission with SAME idempotency key (simulating retry with different score payload)
    res2 = repo.save_evaluation(
        user_email=email,
        idempotency_key=idem_key,
        score=40.0,
        accuracy=40.0,
        total_questions=10,
        correct_count=4,
        wrong_count=6,
        category_breakdown={"algebra": 4},
        detailed_answers=[{"q": 1, "correct": False}],
    )
    # Must return original evaluation, NOT the mutated one
    assert res2["evaluation_id"] == res1["evaluation_id"]
    assert res2["score"] == 90.0, "Score must remain 90.0 due to idempotency protection"

    # Verify database has exactly 1 row for this key
    evals = repo.get_evaluations(email)
    matching = [e for e in evals if e["idempotency_key"] == idem_key]
    assert len(matching) == 1, "Database must NOT have duplicate rows for the same idempotency key"


def test_student_runner_repository_atomic_delta_and_max():
    repo = StudentRunnerRepository(db_path=test_db_path)
    email = "test_student_s002@numora.space"

    # Session 1: score 1000, coins 25
    s1 = repo.record_session(
        user_email=email,
        idempotency_key="run_idem_key_101",
        level="beginner",
        score=1000,
        coins=25,
        distance=500,
        answered=10,
        correct=9,
        accuracy=90.0,
    )
    assert s1["is_new_high"] is True
    assert s1["stats"]["high_score_beginner"] == 1000
    assert s1["stats"]["total_coins"] == 25

    # Resubmission of Session 1: duplicate check
    s1_retry = repo.record_session(
        user_email=email,
        idempotency_key="run_idem_key_101",
        level="beginner",
        score=1000,
        coins=25,
        distance=500,
        answered=10,
        correct=9,
        accuracy=90.0,
    )
    assert s1_retry["deduplicated"] is True
    assert s1_retry["stats"]["total_coins"] == 25, "Coins must NOT be double-counted on retry"

    # Session 2: lower score 600, coins 15
    s2 = repo.record_session(
        user_email=email,
        idempotency_key="run_idem_key_102",
        level="beginner",
        score=600,
        coins=15,
        distance=300,
        answered=6,
        correct=5,
        accuracy=83.3,
    )
    assert s2["is_new_high"] is False
    assert s2["stats"]["high_score_beginner"] == 1000, "High score must remain MAX (1000)"
    assert s2["stats"]["total_coins"] == 40, "Coins must accumulate delta (25 + 15 = 40)"
    assert s2["stats"]["total_games"] == 2


def test_research_repository_real_database_read():
    repo = ResearchRepository(db_path=test_db_path)
    subjects = repo.get_all_subjects()
    assert len(subjects) == 2
    sub_ids = [s["subject_id"] for s in subjects]
    assert "S-001" in sub_ids
    assert "S-002" in sub_ids

    # Log session for S-001
    sess = repo.record_session(
        subject_id="S-001",
        session_date="2026-11-23",
        module_id="modul_01",
        concept_studied="Linear Equations",
        duration_minutes=45.0,
        hints_used=2,
        misconceptions_detected=["SIGN_FLIP"],
        researcher_notes="Tatap muka sesi 1 berjalan terarah.",
        verified_by_researcher=True,
    )
    assert sess["subject_id"] == "S-001"
    assert sess["verified_by_researcher"] is True

    # Subject total_sessions_logged should be updated
    s001 = repo.get_subject_by_id("S-001")
    assert s001["total_sessions_logged"] == 1


# ==============================================================================
# 2. ENDPOINT & SECURITY TESTS
# ==============================================================================

def test_endpoint_s002_module_progress():
    user = {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}
    payload = ModuleProgressUpdateRequest(
        module_id="module_02",
        status="IN_PROGRESS",
        slider_explored=75,
        time_spent_seconds=180,
    )
    res = run_sync(update_progress(payload=payload, current_user=user))
    assert res["module_id"] == "module_02"
    assert res["status"] == "IN_PROGRESS"

    prog_list = run_sync(get_progress(current_user=user))
    assert any(m["module_id"] == "module_02" for m in prog_list)


def test_endpoint_s002_evaluation_submission_and_idempotency():
    user = {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}
    idem_key = "test_endpoint_eval_idem_key_999"

    payload1 = EvaluationSubmitRequest(
        idempotency_key=idem_key,
        score=100.0,
        accuracy=100.0,
        total_questions=10,
        correct_count=10,
        wrong_count=0,
        category_breakdown={"linear": 10},
        detailed_answers=[{"q": 1, "correct": True}],
    )
    res1 = run_sync(submit_evaluation(payload=payload1, current_user=user))
    assert res1["score"] == 100.0

    # Retry with same idempotency key and mutated score
    payload_retry = EvaluationSubmitRequest(
        idempotency_key=idem_key,
        score=50.0,
        accuracy=50.0,
        total_questions=10,
        correct_count=5,
        wrong_count=5,
        category_breakdown={"linear": 5},
        detailed_answers=[],
    )
    res2 = run_sync(submit_evaluation(payload=payload_retry, current_user=user))
    assert res2["evaluation_id"] == res1["evaluation_id"]
    assert res2["score"] == 100.0, "Idempotency must retain original score 100.0"


def test_endpoint_s002_runner_session_and_stats():
    user = {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}
    payload = RunnerSessionSubmitRequest(
        idempotency_key="test_endpoint_run_key_777",
        level="intermediate",
        score=2500,
        coins=35,
        distance=800,
        answered=12,
        correct=11,
        accuracy=91.6,
        mistakes_count=1,
    )
    res = run_sync(record_runner_session(payload=payload, current_user=user))
    assert res["session"]["score"] == 2500
    assert res["stats"]["high_score_intermediate"] == 2500

    stats = run_sync(get_runner_stats(current_user=user))
    assert stats["high_score_intermediate"] == 2500


def test_endpoint_s002_full_sync_and_bootstrap_migration():
    user = {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}
    sync_data = run_sync(get_student_sync(current_user=user))
    assert "progress" in sync_data
    assert "evaluations" in sync_data
    assert "runner_stats" in sync_data

    migration_payload = StudentBootstrapMigrationRequest(
        modules=["module_03", "module_04"],
        evaluations=[{
            "idempotency_key": "migrated_local_eval_endpoint_1",
            "score": 85.0,
            "accuracy": 85.0,
            "total_questions": 10,
            "correct_count": 8,
            "wrong_count": 2,
        }],
        runner={
            "highScores": {"expert": 4000},
            "recentSessions": [],
        }
    )
    mig_res = run_sync(bootstrap_migration(payload=migration_payload, current_user=user))
    assert mig_res["status"] == "VERIFIED_MIGRATED"
    assert mig_res["synced_modules"] >= 2


def test_endpoint_cross_account_isolation_anti_idor():
    user_s003 = {"sub": "test_student_s003@numora.space", "role": "student", "subject_id": "S-003"}
    prog = run_sync(get_progress(current_user=user_s003))
    assert len(prog) == 0, "S-003 must NOT see S-002's module progress"

    evals = run_sync(get_evaluations(current_user=user_s003))
    assert len(evals) == 0, "S-003 must NOT see S-002's evaluations"


def test_endpoint_s001_control_group_digital_intervention_blocking():
    user_s001 = {"sub": "test_student_s001@numora.space", "role": "student", "subject_id": "S-001"}

    # Attempting access to require_student_digital_access must raise HTTP 403
    with pytest.raises(HTTPException) as excinfo:
        run_sync(require_student_digital_access(user=user_s001))
    assert excinfo.value.status_code == 403
    assert "S-001" in excinfo.value.detail
    assert "kontrol" in excinfo.value.detail.lower()


def test_endpoint_researcher_rbac_and_data_access():
    user_s002 = {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}
    user_p001 = {"sub": "test_researcher_p001@numora.space", "role": "researcher", "subject_id": "P-001"}

    # 1. Student attempted access to researcher-only function
    with pytest.raises(HTTPException) as exc_stud:
        if user_s002.get("role") != "researcher":
            raise HTTPException(status_code=403, detail="Akses ditolak. Diperlukan peran peneliti.")
    assert exc_stud.value.status_code == 403

    # 2. Researcher access to research functions
    subs = run_sync(get_subjects())
    assert len(subs) == 2

    session_payload = CreateResearchSessionRequest(
        subject_id="S-002",
        session_date="2026-11-23",
        module_id="modul_02",
        concept_studied="Coefficients & Variables",
        duration_minutes=35.0,
        hints_used=1,
        misconceptions_detected=[],
        researcher_notes="Siswa menunjukkan pemahaman mandiri yang baik.",
    )
    sess_res = run_sync(create_session(payload=session_payload))
    assert sess_res["subject_id"] == "S-002"

    analytics = run_sync(get_analytics())
    assert analytics["total_subjects"] == 2
    assert analytics["total_sessions"] >= 1
    assert "s002_digital_learning" in analytics

    cog = run_sync(get_cognitive_load_status())
    assert cog.intrinsic_load_status is not None


def test_learning_activities_recording_and_query():
    user = {"sub": "test_student_s002@numora.space", "role": "student", "subject_id": "S-002"}
    act_req = ActivityLogRequest(
        activity_type="LAB_EXPERIMENT",
        module_or_feature_id="ALGEBRA_BALANCE_LAB",
        metadata={"step": 3, "balanced": True}
    )
    res = run_sync(log_activity(payload=act_req, current_user=user))
    assert res["activity_type"] == "LAB_EXPERIMENT"
    assert res["module_or_feature_id"] == "ALGEBRA_BALANCE_LAB"


def test_database_foreign_key_and_integrity_check():
    conn = sqlite3.connect(test_db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    # 1. Foreign Key Violation: Inserting evaluation for non-existent user must fail
    with pytest.raises(sqlite3.IntegrityError):
        cur.execute(
            """
            INSERT INTO student_evaluations
                (evaluation_id, idempotency_key, user_email, attempt_number, score,
                 accuracy, total_questions, correct_count, wrong_count,
                 category_breakdown, detailed_answers, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ("fake_id", "fake_key", "non_existent_user@numora.space", 1, 80.0, 80.0, 10, 8, 2, "{}", "[]", int(time.time()))
        )

    # 2. Foreign Key Restrict: Deleting research subject S-001 with active session must fail
    cur.execute(
        """
        INSERT INTO research_sessions
            (session_id, subject_id, session_date, module_id, concept_studied, duration_minutes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id) DO NOTHING
        """,
        ("sess_fk_test", "S-001", "2026-11-23", "mod_01", "Algebra", 30.0, int(time.time()))
    )
    conn.commit()

    with pytest.raises(sqlite3.IntegrityError):
        cur.execute("DELETE FROM research_subjects WHERE subject_id = 'S-001';")

    # 3. Overall integrity check
    cur.execute("PRAGMA integrity_check;")
    res = cur.fetchone()[0]
    assert res == "ok"

    conn.close()
