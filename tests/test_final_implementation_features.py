"""
NUMORA Space — Final Implementation Features Test Suite
Verifies:
1. Researcher Login Endpoint (POST /api/v1/auth/researcher/login)
2. Researcher RBAC for Public Users Summary & Dossier
3. Official Research Cohort (S-001 & S-002) vs Public Users Separation
4. CSV & JSON Export Endpoints
5. Student Privacy & Data Deletion Endpoint
"""
import os
import sqlite3
import time
import pytest
import anyio
from fastapi import HTTPException
from starlette.requests import Request

test_db_path = os.path.abspath("backend/app/data/test_final_features.db")
os.environ["NUMORA_SECURITY_DB_PATH"] = test_db_path

from backend.app.core.config import settings
from backend.app.core.security import hash_password, create_access_token
from backend.app.services.token_revocation_store import PersistentSecurityStore, security_store
from backend.app.services.auth_service import AuthService, auth_service
from backend.app.repositories.research_repository import ResearchRepository
from backend.app.repositories.learning_activity_repository import LearningActivityRepository
from backend.app.repositories.student_progress_repository import StudentProgressRepository
from backend.app.repositories.student_evaluation_repository import StudentEvaluationRepository
from backend.app.repositories.student_runner_repository import StudentRunnerRepository
from backend.app.services.student_sync_service import StudentSyncService
from backend.app.schemas.auth import ResearcherLoginRequest
from backend.app.api.v1.endpoints.auth import login_researcher
from backend.app.api.v1.endpoints.research import (
    get_public_users_summary,
    get_user_dossier,
    export_csv,
    export_json
)
from backend.app.api.v1.endpoints.student import delete_my_data


def run_sync(coro):
    """Executes an async FastAPI handler without relying on sandbox-blocked socketpair event loops."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did an await!")


def setup_module():
    os.environ["NUMORA_SECURITY_DB_PATH"] = test_db_path
    security_store.db_path = test_db_path
    auth_service._security_store = security_store
    if os.path.exists(test_db_path):
        os.remove(test_db_path)

    conn = sqlite3.connect(test_db_path)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    # 1. Users
    cur.execute("""
        CREATE TABLE users (
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

    # 2. Revoked tokens & rate limits
    cur.execute("""
        CREATE TABLE revoked_tokens (
            jti TEXT PRIMARY KEY,
            expires_at INTEGER NOT NULL,
            revoked_at INTEGER NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE login_rate_limits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            attempt_time INTEGER NOT NULL
        )
    """)

    # 3. Schema migrations
    cur.execute("CREATE TABLE schema_migrations (version TEXT PRIMARY KEY, name TEXT NOT NULL, applied_at INTEGER NOT NULL)")

    # 4. Student module progress
    cur.execute("""
        CREATE TABLE student_module_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            module_id TEXT NOT NULL,
            status TEXT NOT NULL,
            slider_explored INTEGER NOT NULL DEFAULT 0,
            time_spent_seconds INTEGER NOT NULL DEFAULT 0,
            completed_at INTEGER,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
            UNIQUE(user_email, module_id)
        )
    """)

    # 5. Student evaluations
    cur.execute("""
        CREATE TABLE student_evaluations (
            evaluation_id TEXT PRIMARY KEY,
            idempotency_key TEXT NOT NULL UNIQUE,
            user_email TEXT NOT NULL,
            attempt_number INTEGER NOT NULL,
            score REAL NOT NULL,
            accuracy REAL NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            wrong_count INTEGER NOT NULL,
            category_breakdown TEXT NOT NULL,
            detailed_answers TEXT NOT NULL,
            completed_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    # 6. Student runner
    cur.execute("""
        CREATE TABLE student_runner_stats (
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
    cur.execute("""
        CREATE TABLE student_runner_sessions (
            session_id TEXT PRIMARY KEY,
            idempotency_key TEXT NOT NULL UNIQUE,
            user_email TEXT NOT NULL,
            level TEXT NOT NULL,
            score INTEGER NOT NULL,
            coins INTEGER NOT NULL,
            distance INTEGER NOT NULL,
            answered INTEGER NOT NULL,
            correct INTEGER NOT NULL,
            accuracy REAL NOT NULL,
            mistakes_count INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    # 7. Learning activities
    cur.execute("""
        CREATE TABLE learning_activities (
            activity_id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            module_or_feature_id TEXT NOT NULL,
            metadata_json TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    # 8. Research subjects & sessions
    cur.execute("""
        CREATE TABLE research_subjects (
            subject_id TEXT PRIMARY KEY,
            group_name TEXT NOT NULL,
            role_description TEXT NOT NULL,
            grade TEXT NOT NULL,
            active_module TEXT NOT NULL,
            pretest_status TEXT NOT NULL,
            pretest_score REAL,
            posttest_status TEXT NOT NULL,
            posttest_score REAL,
            cognitive_load_status TEXT NOT NULL,
            total_sessions_logged INTEGER NOT NULL DEFAULT 0,
            protocol_category TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE research_sessions (
            session_id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL,
            session_date TEXT NOT NULL,
            module_id TEXT NOT NULL,
            concept_studied TEXT NOT NULL,
            duration_minutes REAL NOT NULL,
            hints_used INTEGER NOT NULL DEFAULT 0,
            misconceptions_detected TEXT,
            researcher_notes TEXT,
            verified_by_researcher INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (subject_id) REFERENCES research_subjects(subject_id)
        )
    """)
    cur.execute("""
        CREATE TABLE research_cognitive_load_records (
            record_id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL,
            session_id TEXT,
            framework_name TEXT NOT NULL,
            intrinsic_load REAL,
            extraneous_load REAL,
            germane_load REAL,
            instrument_status TEXT NOT NULL,
            measured_at INTEGER NOT NULL
        )
    """)

    # Seed data: Researcher P-001, Student S-001, Student S-002, Public User
    now = int(time.time())
    users_data = [
        ("peneliti.demo@numora.space", hash_password("demo-riset-2026"), "researcher", "Tim Peneliti Matematika", "P-001", "Evaluator", "local", now, 1),
        ("siswa.demo@numora.space", hash_password("ValidPassword123"), "student", "Siswa Kelas VII (S-002)", "S-002", "SMP Kelas VII", "local", now, 0),
        ("siswa.control@numora.space", hash_password("ValidPassword123"), "student", "Siswa Kontrol (S-001)", "S-001", "SMP Kelas VII", "local", now, 0),
        ("public.user@example.com", hash_password("RandomPass123"), "student", "Budi Santoso", "U-BUDI12345", "SMP Kelas VII", "google", now, 0),
    ]
    cur.executemany(
        "INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, ?)",
        users_data
    )

    # Seed research subjects (strictly S-001 and S-002)
    cur.execute("""
        INSERT INTO research_subjects VALUES
        ('S-001', 'Control (Tatap Muka)', 'Kelompok kontrol tatap muka', 'SMP Kelas VII', 'Modul 02', 'Scheduled', NULL, 'Scheduled', NULL, 'NOT CONFIGURED', 0, 'PROTOCOL_TEMPLATE', ?, ?),
        ('S-002', 'Experimental (NUMORA)', 'Kelompok intervensi NUMORA', 'SMP Kelas VII', 'Modul 02', 'Scheduled', NULL, 'Scheduled', NULL, 'NOT CONFIGURED', 0, 'PROTOCOL_TEMPLATE', ?, ?)
    """, (now, now, now, now))

    # Seed public user learning data
    cur.execute("INSERT INTO student_module_progress (user_email, module_id, status, slider_explored, time_spent_seconds, completed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                ("public.user@example.com", "mod_01", "COMPLETED", 100, 300, now, now))
    cur.execute("INSERT INTO student_evaluations (evaluation_id, idempotency_key, user_email, attempt_number, score, accuracy, total_questions, correct_count, wrong_count, category_breakdown, detailed_answers, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                ("eval_budi", "idem_budi", "public.user@example.com", 1, 90.0, 90.0, 10, 9, 1, "{}", "[]", now))
    cur.execute("INSERT INTO student_runner_stats (user_email, high_score_beginner, total_games, total_coins, total_distance, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                ("public.user@example.com", 1500, 3, 45, 800, now))
    cur.execute("INSERT INTO learning_activities (activity_id, user_email, activity_type, module_or_feature_id, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                ("act_budi", "public.user@example.com", "LOGIN", "auth", "{}", now))

    conn.commit()
    conn.close()


def teardown_module():
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except OSError:
            pass


def test_researcher_login_endpoint():
    req = Request(scope={"type": "http", "client": ("127.0.0.1", 12345), "headers": []})
    
    # 1. Valid researcher credentials
    payload = ResearcherLoginRequest(email="peneliti.demo@numora.space", password="demo-riset-2026")
    res = run_sync(login_researcher(request=req, payload=payload))
    assert res.access_token is not None
    assert res.user.role == "researcher"
    assert res.user.subject_id == "P-001"

    # 2. Invalid password
    with pytest.raises(HTTPException) as exc:
        bad_payload = ResearcherLoginRequest(email="peneliti.demo@numora.space", password="WrongPassword!")
        run_sync(login_researcher(request=req, payload=bad_payload))
    assert exc.value.status_code == 401

    # 3. Student attempting researcher login
    with pytest.raises(HTTPException) as exc:
        student_payload = ResearcherLoginRequest(email="siswa.demo@numora.space", password="ValidPassword123")
        run_sync(login_researcher(request=req, payload=student_payload))
    assert exc.value.status_code in (401, 403)


def test_public_users_summary_and_dossier():
    summary = run_sync(get_public_users_summary())
    assert len(summary) >= 4

    # Verify separation
    s001_item = next(u for u in summary if u["subject_id"] == "S-001")
    s002_item = next(u for u in summary if u["subject_id"] == "S-002")
    budi_item = next(u for u in summary if u["email"] == "public.user@example.com")

    assert s001_item["is_official_research_subject"] is True
    assert s002_item["is_official_research_subject"] is True
    assert budi_item["is_official_research_subject"] is False
    assert budi_item["modules_completed"] == 1
    assert budi_item["evaluations_count"] == 1
    assert budi_item["runner_high_score"] == 1500

    # Test dossier
    dossier = run_sync(get_user_dossier("public.user@example.com"))
    assert dossier["user"]["email"] == "public.user@example.com"
    assert len(dossier["modules"]) == 1
    assert len(dossier["evaluations"]) == 1
    assert dossier["runner_stats"]["total_games"] == 3


def test_csv_and_json_export():
    csv_res = run_sync(export_csv())
    assert csv_res.media_type == "text/csv"
    content = csv_res.body.decode("utf-8")
    assert "Cohort_Type" in content
    assert "public.user@example.com" in content
    assert "S-001" in content
    assert "S-002" in content

    json_res = run_sync(export_json())
    assert "official_research_cohort" in json_res
    assert len(json_res["official_research_cohort"]["subjects"]) == 2
    assert "public_learning_users" in json_res
    assert len(json_res["public_learning_users"]["users"]) >= 4


def test_privacy_delete_my_data():
    # 1. Research subject S-002 cannot delete data (protocol protection)
    s002_user = {"sub": "siswa.demo@numora.space", "role": "student", "subject_id": "S-002"}
    with pytest.raises(HTTPException) as exc:
        run_sync(delete_my_data(current_user=s002_user))
    assert exc.value.status_code == 403

    # 2. Public user can delete their own learning data
    budi_user = {"sub": "public.user@example.com", "role": "student", "subject_id": "U-BUDI12345"}
    del_res = run_sync(delete_my_data(current_user=budi_user))
    assert del_res["success"] is True
    assert del_res["details"]["modules_deleted"] == 1
    assert del_res["details"]["evaluations_deleted"] == 1
    assert del_res["details"]["activities_deleted"] == 1

    # Verify dossier is now clean for budi
    dossier = run_sync(get_user_dossier("public.user@example.com"))
    assert len(dossier["modules"]) == 0
    assert len(dossier["evaluations"]) == 0
    assert len(dossier["activities"]) == 0
