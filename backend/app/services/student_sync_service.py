"""
NUMORA Space — Student Sync & Data Persistence Service
Coordinates repositories for multi-device sync, localStorage bootstrap migration,
and atomic updates across modules, evaluations, runner stats, and learning activities.
"""
import time
from typing import Dict, Any, List, Optional
from backend.app.repositories.student_progress_repository import StudentProgressRepository
from backend.app.repositories.student_evaluation_repository import StudentEvaluationRepository
from backend.app.repositories.student_runner_repository import StudentRunnerRepository
from backend.app.repositories.learning_activity_repository import LearningActivityRepository


class StudentSyncService:
    def __init__(self, db_path: Optional[str] = None):
        self.progress_repo = StudentProgressRepository(db_path=db_path)
        self.eval_repo = StudentEvaluationRepository(db_path=db_path)
        self.runner_repo = StudentRunnerRepository(db_path=db_path)
        self.activity_repo = LearningActivityRepository(db_path=db_path)

    def get_full_student_state(self, user_email: str) -> Dict[str, Any]:
        """
        Mengambil kondisi data persisten lengkap siswa dari database:
        - Progres modul aljabar
        - Riwayat evaluasi (append-only)
        - Statistik NUMORA RUN
        - Riwayat sesi NUMORA RUN (lengkap)
        - Aktivitas pembelajaran terbaru
        """
        progress = self.progress_repo.get_all_progress(user_email)
        evaluations = self.eval_repo.get_evaluations(user_email)
        runner_stats = self.runner_repo.get_stats(user_email)
        runner_sessions = self.runner_repo.get_sessions(user_email, limit=50)
        activities = self.activity_repo.get_activities(user_email, limit=20)

        return {
            "user_email": user_email,
            "server_time": int(time.time()),
            "progress": progress,
            "evaluations": evaluations,
            "runner_stats": runner_stats,
            "runner_sessions": runner_sessions,
            "activities": activities,
        }

    def bootstrap_migrate_local_data(
        self,
        user_email: str,
        local_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Migrasi bootstrap data lama dari localStorage klien:
        State Machine: UNMIGRATED -> MIGRATING -> VERIFIED_MIGRATED.
        1. Modul disinkronkan via union-set (status COMPLETED tidak pernah hilang).
        2. Evaluasi disisipkan dengan idempotency_key unik.
        3. Runner disinkronkan dengan MAX high-score dan incremental delta.
        """
        synced_modules = 0
        synced_evaluations = 0
        synced_runner_sessions = 0

        # 1. Migrasi Modul
        raw_modules = local_data.get("modules", [])
        if isinstance(raw_modules, list) and raw_modules:
            module_items = []
            for item in raw_modules:
                if isinstance(item, str):
                    # Format sederhana: ["module_1", "module_2"]
                    module_items.append({
                        "module_id": item,
                        "status": "COMPLETED",
                        "slider_explored": 100,
                        "time_spent_seconds": 300,
                    })
                elif isinstance(item, dict) and "module_id" in item:
                    module_items.append(item)
            if module_items:
                res = self.progress_repo.batch_upsert_progress(user_email, module_items)
                synced_modules = len(res)

        # 2. Migrasi Evaluasi
        raw_evaluations = local_data.get("evaluations", [])
        if isinstance(raw_evaluations, list):
            for ev in raw_evaluations:
                if not isinstance(ev, dict):
                    continue
                idem_key = ev.get("idempotency_key") or f"migrated_eval_{ev.get('timestamp', int(time.time()))}_{ev.get('score', 0)}"
                self.eval_repo.save_evaluation(
                    user_email=user_email,
                    idempotency_key=idem_key,
                    score=float(ev.get("score", 0.0)),
                    accuracy=float(ev.get("accuracy", 0.0)),
                    total_questions=int(ev.get("total_questions", 10)),
                    correct_count=int(ev.get("correct_count", 0)),
                    wrong_count=int(ev.get("wrong_count", 0)),
                    category_breakdown=ev.get("category_breakdown", {}),
                    detailed_answers=ev.get("detailed_answers", []),
                    completed_at=int(ev.get("completed_at") or ev.get("timestamp") or time.time()),
                )
                synced_evaluations += 1

        # 3. Migrasi Sesi Runner
        raw_runner = local_data.get("runner", {})
        if isinstance(raw_runner, dict):
            # Sesi lama
            sessions = raw_runner.get("recentSessions", [])
            if isinstance(sessions, list):
                for s in sessions:
                    if not isinstance(s, dict):
                        continue
                    s_id = s.get("id") or s.get("session_id")
                    idem_key = s.get("idempotency_key") or f"migrated_run_{s_id}"
                    self.runner_repo.record_session(
                        user_email=user_email,
                        idempotency_key=idem_key,
                        level=s.get("level", "beginner"),
                        score=int(s.get("score", 0)),
                        coins=int(s.get("coins", 0)),
                        distance=int(s.get("distance", 0)),
                        answered=int(s.get("answered", 0)),
                        correct=int(s.get("correct", 0)),
                        accuracy=float(s.get("accuracy", 0.0)),
                        mistakes_count=int(s.get("mistakesCount", 0)),
                        created_at=int(time.time()),
                        session_id=s_id,
                    )
                    synced_runner_sessions += 1

            # High scores & counters delta
            high_scores = raw_runner.get("highScores", {})
            if high_scores:
                self.runner_repo.update_stats_delta(
                    user_email=user_email,
                    high_scores=high_scores
                )

        # Catat aktivitas migrasi
        self.activity_repo.record_activity(
            user_email=user_email,
            activity_type="LOGIN",
            module_or_feature_id="STORAGE_MIGRATION",
            metadata={
                "status": "VERIFIED_MIGRATED",
                "synced_modules": synced_modules,
                "synced_evaluations": synced_evaluations,
                "synced_runner_sessions": synced_runner_sessions,
            }
        )

        return {
            "status": "VERIFIED_MIGRATED",
            "synced_modules": synced_modules,
            "synced_evaluations": synced_evaluations,
            "synced_runner_sessions": synced_runner_sessions,
            "current_state": self.get_full_student_state(user_email)
        }


# Singleton default
student_sync_service = StudentSyncService()
