"""
NUMORA Space — PostgreSQL Compatibility & Dialect Adaptation Unit Tests
Verifies:
1. SQL placeholder adaptation ('?' -> '%s').
2. Scalar MAX adaptation to GREATEST for PostgreSQL.
3. Preservation of question marks inside string literals.
4. Database URL normalizer (postgres:// -> postgresql:// and sslmode=require for Neon).
5. Seamless backward compatibility of BaseRepository, repositories, and security_store on SQLite.
"""
import pytest
from backend.app.core.database import (
    convert_placeholders,
    adapt_postgres_syntax,
    normalize_database_url,
    ConnectionProxy,
    CursorProxy,
)
from backend.app.repositories.student_progress_repository import StudentProgressRepository
from backend.app.repositories.student_evaluation_repository import StudentEvaluationRepository
from backend.app.repositories.student_runner_repository import StudentRunnerRepository
from backend.app.repositories.learning_activity_repository import LearningActivityRepository
from backend.app.repositories.research_repository import ResearchRepository
from backend.app.services.token_revocation_store import security_store


def test_placeholder_conversion():
    # Simple query
    sql1 = "SELECT * FROM users WHERE email = ? AND role = ?"
    adapted1 = convert_placeholders(sql1)
    assert adapted1 == "SELECT * FROM users WHERE email = %s AND role = %s"

    # Query with question mark inside string literal
    sql2 = "SELECT ? AS id, 'Is this a question? Yes!' AS title FROM dual WHERE status = ?"
    adapted2 = convert_placeholders(sql2)
    assert adapted2 == "SELECT %s AS id, 'Is this a question? Yes!' AS title FROM dual WHERE status = %s"

    # Multi-argument scalar MAX conversion to GREATEST
    sql3 = "UPDATE student_runner_stats SET high_score_beginner = MAX(high_score_beginner, ?)"
    adapted3 = adapt_postgres_syntax(sql3)
    assert adapted3 == "UPDATE student_runner_stats SET high_score_beginner = GREATEST(high_score_beginner, %s)"

    # Aggregate single-argument MAX should NOT be converted to GREATEST
    sql4 = "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM student_evaluations WHERE user_email = ?"
    adapted4 = adapt_postgres_syntax(sql4)
    assert adapted4 == "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM student_evaluations WHERE user_email = %s"


def test_database_url_normalization():
    # Convert postgres:// to postgresql://
    url1 = "postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb"
    normalized1 = normalize_database_url(url1)
    assert normalized1.startswith("postgresql://")
    assert "sslmode=require" in normalized1

    # Preserve existing sslmode
    url2 = "postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=verify-full"
    normalized2 = normalize_database_url(url2)
    assert normalized2 == url2

    # None or non-postgres URLs
    assert normalize_database_url(None) is None
    assert normalize_database_url("sqlite:///foo.db") is None


def test_sqlite_repositories_backward_compatibility():
    # Verify that existing repositories work seamlessly with db_manager on active SQLite
    from pathlib import Path
    real_db_path = str(Path(__file__).resolve().parent.parent / "backend" / "app" / "data" / "security_store.db")
    prog_repo = StudentProgressRepository(db_path=real_db_path)
    eval_repo = StudentEvaluationRepository(db_path=real_db_path)
    runner_repo = StudentRunnerRepository(db_path=real_db_path)
    activity_repo = LearningActivityRepository(db_path=real_db_path)
    research_repo = ResearchRepository(db_path=real_db_path)
    from backend.app.services.token_revocation_store import PersistentSecurityStore
    real_sec_store = PersistentSecurityStore(db_path=real_db_path)

    # 1. Research subjects query
    subjects = research_repo.get_all_subjects()
    assert len(subjects) >= 2
    subject_ids = [s["subject_id"] for s in subjects]
    assert "S-001" in subject_ids
    assert "S-002" in subject_ids

    # 2. Security store query
    assert real_sec_store.is_healthy() is True
    p001_user = real_sec_store.get_user_by_email("peneliti.demo@numora.space")
    assert p001_user is not None
    assert p001_user["role"] == "researcher"
    assert p001_user["subject_id"] == "P-001"

    # 3. Public users summary
    public_users = research_repo.get_public_users_summary()
    assert len(public_users) >= 5

    # 4. Runner stats default
    stats = runner_repo.get_stats("siswa.demo@numora.space")
    assert "high_score_beginner" in stats
    assert stats["user_email"] == "siswa.demo@numora.space"
