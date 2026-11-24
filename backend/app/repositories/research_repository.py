"""
NUMORA Space — Research Data Repository
Secure management of research subjects (S-001 & S-002), verified research session logs,
cognitive load measurement records, and authentic empirical analytics.
"""
import json
import time
import uuid
from typing import List, Optional, Dict, Any
from backend.app.repositories.base import BaseRepository


class ResearchRepository(BaseRepository):
    def get_all_subjects(self) -> List[Dict[str, Any]]:
        query = """
            SELECT subject_id, group_name, role_description, grade,
                   active_module, pretest_status, pretest_score,
                   posttest_status, posttest_score, cognitive_load_status,
                   total_sessions_logged, protocol_category, created_at, updated_at
            FROM research_subjects
            ORDER BY subject_id ASC
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query)
            rows = cursor.fetchall()
            return [
                {
                    "subject_id": r["subject_id"],
                    "group": r["group_name"],
                    "role_description": r["role_description"],
                    "grade": r["grade"],
                    "active_module": r["active_module"],
                    "pretest_status": r["pretest_status"],
                    "pretest_score": r["pretest_score"],
                    "posttest_status": r["posttest_status"],
                    "posttest_score": r["posttest_score"],
                    "cognitive_load_status": r["cognitive_load_status"],
                    "total_sessions_logged": r["total_sessions_logged"],
                    "data_source": r["protocol_category"],
                }
                for r in rows
            ]

    def get_subject_by_id(self, subject_id: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT subject_id, group_name, role_description, grade,
                   active_module, pretest_status, pretest_score,
                   posttest_status, posttest_score, cognitive_load_status,
                   total_sessions_logged, protocol_category, created_at, updated_at
            FROM research_subjects
            WHERE subject_id = ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (subject_id,))
            r = cursor.fetchone()
            if not r:
                return None
            return {
                "subject_id": r["subject_id"],
                "group": r["group_name"],
                "role_description": r["role_description"],
                "grade": r["grade"],
                "active_module": r["active_module"],
                "pretest_status": r["pretest_status"],
                "pretest_score": r["pretest_score"],
                "posttest_status": r["posttest_status"],
                "posttest_score": r["posttest_score"],
                "cognitive_load_status": r["cognitive_load_status"],
                "total_sessions_logged": r["total_sessions_logged"],
                "data_source": r["protocol_category"],
            }

    def get_sessions(self, subject_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if subject_id:
            query = """
                SELECT session_id, subject_id, session_date, module_id,
                       concept_studied, duration_minutes, hints_used,
                       misconceptions_detected, researcher_notes,
                       verified_by_researcher, created_at
                FROM research_sessions
                WHERE subject_id = ?
                ORDER BY created_at DESC
            """
            params = (subject_id,)
        else:
            query = """
                SELECT session_id, subject_id, session_date, module_id,
                       concept_studied, duration_minutes, hints_used,
                       misconceptions_detected, researcher_notes,
                       verified_by_researcher, created_at
                FROM research_sessions
                ORDER BY created_at DESC
            """
            params = ()

        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                misc = r["misconceptions_detected"]
                if isinstance(misc, str):
                    try:
                        misc = json.loads(misc)
                    except Exception:
                        misc = []
                results.append({
                    "session_id": r["session_id"],
                    "subject_id": r["subject_id"],
                    "session_date": r["session_date"],
                    "module_id": r["module_id"],
                    "concept_studied": r["concept_studied"],
                    "duration_minutes": r["duration_minutes"],
                    "hints_used": r["hints_used"],
                    "misconceptions_detected": misc,
                    "notes": r["researcher_notes"],
                    "verified_by_researcher": bool(r["verified_by_researcher"]),
                    "created_at": r["created_at"],
                    "data_source": "ACTUAL_EMPIRICAL",
                })
            return results

    def record_session(
        self,
        subject_id: str,
        session_date: str,
        module_id: str,
        concept_studied: str,
        duration_minutes: float,
        hints_used: int = 0,
        misconceptions_detected: Optional[Any] = None,
        researcher_notes: Optional[str] = None,
        verified_by_researcher: bool = True,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        sess_id = session_id or f"rsess_{uuid.uuid4().hex}"
        now = int(time.time())
        misc_json = (
            misconceptions_detected
            if isinstance(misconceptions_detected, str)
            else json.dumps(misconceptions_detected or [])
        )

        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO research_sessions
                    (session_id, subject_id, session_date, module_id,
                     concept_studied, duration_minutes, hints_used,
                     misconceptions_detected, researcher_notes,
                     verified_by_researcher, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    sess_id,
                    subject_id,
                    session_date,
                    module_id,
                    concept_studied,
                    float(duration_minutes),
                    int(hints_used),
                    misc_json,
                    researcher_notes,
                    1 if verified_by_researcher else 0,
                    now,
                )
            )

            # Update counter di research_subjects
            conn.execute(
                """
                UPDATE research_subjects
                SET total_sessions_logged = total_sessions_logged + 1,
                    updated_at = ?
                WHERE subject_id = ?
                """,
                (now, subject_id)
            )

        sessions = self.get_sessions(subject_id=subject_id)
        for s in sessions:
            if s["session_id"] == sess_id:
                return s
        return {
            "session_id": sess_id,
            "subject_id": subject_id,
            "session_date": session_date,
            "module_id": module_id,
            "concept_studied": concept_studied,
            "duration_minutes": duration_minutes,
            "hints_used": hints_used,
            "misconceptions_detected": json.loads(misc_json),
            "notes": researcher_notes,
            "verified_by_researcher": verified_by_researcher,
            "created_at": now,
        }

    def get_cognitive_load_records(self, subject_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if subject_id:
            query = """
                SELECT record_id, subject_id, session_id, framework_name,
                       intrinsic_load, extraneous_load, germane_load,
                       instrument_status, measured_at
                FROM research_cognitive_load_records
                WHERE subject_id = ?
                ORDER BY measured_at DESC
            """
            params = (subject_id,)
        else:
            query = """
                SELECT record_id, subject_id, session_id, framework_name,
                       intrinsic_load, extraneous_load, germane_load,
                       instrument_status, measured_at
                FROM research_cognitive_load_records
                ORDER BY measured_at DESC
            """
            params = ()

        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_analytics_summary(self) -> Dict[str, Any]:
        """
        Menghasilkan ringkasan analitik berbasis data aktual di database.
        Tidak ada angka palsu atau simulasi; jika data belum diisi, ditampilkan status jujur.
        """
        with self.get_connection() as conn:
            # 1. Subjek penelitian
            cur = conn.execute("SELECT COUNT(*) AS total FROM research_subjects")
            total_subjects = cur.fetchone()["total"]

            # 2. Total sesi penelitian
            cur = conn.execute("SELECT COUNT(*) AS total, COALESCE(SUM(duration_minutes), 0) AS total_duration FROM research_sessions")
            sess_row = cur.fetchone()
            total_sessions = sess_row["total"]
            total_duration = sess_row["total_duration"]

            # 3. Data pembelajaran digital S-002
            cur = conn.execute(
                """
                SELECT p.module_id, p.status, p.time_spent_seconds, p.completed_at
                FROM student_module_progress p
                JOIN users u ON u.email = p.user_email
                WHERE u.subject_id = 'S-002'
                """
            )
            s002_progress = [dict(r) for r in cur.fetchall()]

            # 4. Evaluasi S-002
            cur = conn.execute(
                """
                SELECT e.evaluation_id, e.score, e.accuracy, e.completed_at, e.correct_count, e.wrong_count
                FROM student_evaluations e
                JOIN users u ON u.email = e.user_email
                WHERE u.subject_id = 'S-002'
                ORDER BY e.completed_at ASC
                """
            )
            s002_evaluations = [dict(r) for r in cur.fetchall()]

            # 5. Runner stats S-002
            cur = conn.execute(
                """
                SELECT s.*
                FROM student_runner_stats s
                JOIN users u ON u.email = s.user_email
                WHERE u.subject_id = 'S-002'
                """
            )
            runner_row = cur.fetchone()
            s002_runner = dict(runner_row) if runner_row else None

            # 6. Beban Kognitif
            cur = conn.execute("SELECT COUNT(*) AS total FROM research_cognitive_load_records")
            cog_count = cur.fetchone()["total"]

        return {
            "total_subjects": total_subjects,
            "total_sessions": total_sessions,
            "total_duration_minutes": total_duration,
            "s002_digital_learning": {
                "modules_tracked": len(s002_progress),
                "modules_completed": sum(1 for m in s002_progress if m["status"] == "COMPLETED"),
                "total_time_spent_seconds": sum(m["time_spent_seconds"] for m in s002_progress),
                "evaluations_count": len(s002_evaluations),
                "latest_evaluation_score": s002_evaluations[-1]["score"] if s002_evaluations else None,
                "runner_stats": s002_runner,
            },
            "cognitive_load_records_count": cog_count,
            "cognitive_load_instrument_status": "NOT CONFIGURED" if cog_count == 0 else "ACTIVE",
            "protocol_compliance": {
                "s001_role": "Control (Direct Teaching)",
                "s002_role": "Experimental (NUMORA Space Assisted)",
                "s001_digital_intervention_blocked": True,
            }
        }

    def get_public_users_summary(self) -> List[Dict[str, Any]]:
        """
        Mengembalikan daftar seluruh pengguna terdaftar dengan ringkasan aktivitas belajar.
        Memisahkan secara eksplisit antara peserta resmi penelitian (S-001/S-002) dan pengguna publik.
        """
        query = """
            SELECT email, role, name, subject_id, grade, auth_provider, created_at, is_provisioned_researcher
            FROM users
            ORDER BY created_at DESC
        """
        results = []
        with self.get_connection() as conn:
            users_rows = conn.execute(query).fetchall()
            for u in users_rows:
                email = u["email"]
                sub_id = u["subject_id"]
                is_research = sub_id in ("S-001", "S-002")

                # Hitung modul selesai
                cur = conn.execute(
                    "SELECT COUNT(DISTINCT module_id) AS cnt FROM student_module_progress WHERE user_email = ? AND status = 'COMPLETED'",
                    (email,)
                )
                modules_completed = cur.fetchone()["cnt"]

                # Hitung evaluasi
                cur = conn.execute(
                    "SELECT COUNT(*) AS cnt, MAX(score) AS max_score FROM student_evaluations WHERE user_email = ?",
                    (email,)
                )
                eval_row = cur.fetchone()
                evaluations_count = eval_row["cnt"]
                max_eval_score = eval_row["max_score"]

                # Ambil evaluasi terbaru
                cur = conn.execute(
                    "SELECT score, accuracy, completed_at FROM student_evaluations WHERE user_email = ? ORDER BY completed_at DESC LIMIT 1",
                    (email,)
                )
                latest_eval = cur.fetchone()

                # Hitung statistik runner
                cur = conn.execute(
                    "SELECT total_games, total_coins, total_distance, high_score_beginner, high_score_intermediate, high_score_advanced, high_score_expert FROM student_runner_stats WHERE user_email = ?",
                    (email,)
                )
                runner_row = cur.fetchone()
                runner_games = runner_row["total_games"] if runner_row else 0
                runner_coins = runner_row["total_coins"] if runner_row else 0
                runner_distance = runner_row["total_distance"] if runner_row else 0
                runner_high = 0
                if runner_row:
                    runner_high = max(
                        runner_row["high_score_beginner"] or 0,
                        runner_row["high_score_intermediate"] or 0,
                        runner_row["high_score_advanced"] or 0,
                        runner_row["high_score_expert"] or 0,
                    )

                # Hitung total aktivitas
                cur = conn.execute(
                    "SELECT COUNT(*) AS cnt, MAX(created_at) AS last_active FROM learning_activities WHERE user_email = ?",
                    (email,)
                )
                act_row = cur.fetchone()
                activities_count = act_row["cnt"]
                last_active = act_row["last_active"] or u["created_at"]

                results.append({
                    "email": email,
                    "name": u["name"],
                    "subject_id": sub_id,
                    "role": u["role"],
                    "grade": u["grade"],
                    "auth_provider": u["auth_provider"],
                    "is_official_research_subject": is_research,
                    "cohort_type": "OFFICIAL_RESEARCH" if is_research else "PUBLIC_STUDENT" if u["role"] == "student" else "RESEARCH_STAFF",
                    "registered_at": u["created_at"],
                    "last_active_at": last_active,
                    "modules_completed": modules_completed,
                    "evaluations_count": evaluations_count,
                    "latest_evaluation_score": latest_eval["score"] if latest_eval else None,
                    "max_evaluation_score": max_eval_score,
                    "runner_games": runner_games,
                    "runner_coins": runner_coins,
                    "runner_distance": runner_distance,
                    "runner_high_score": runner_high,
                    "activities_count": activities_count,
                })
        return results

    def get_user_detailed_dossier(self, user_email: str) -> Optional[Dict[str, Any]]:
        """
        Mengembalikan rekam jejak lengkap (dossier) seorang pengguna untuk audit evaluasi pembelajaran:
        profil, progres modul, evaluasi soal per soal, riwayat sesi runner, dan linimasa aktivitas.
        """
        with self.get_connection() as conn:
            # 1. Profil pengguna
            cur = conn.execute("SELECT * FROM users WHERE email = ?", (user_email.strip().lower(),))
            user_row = cur.fetchone()
            if not user_row:
                return None
            user_dict = dict(user_row)
            user_dict.pop("hashed_password", None)

            # 2. Progres modul
            cur = conn.execute(
                "SELECT module_id, status, slider_explored, time_spent_seconds, completed_at, updated_at FROM student_module_progress WHERE user_email = ? ORDER BY module_id ASC",
                (user_email,)
            )
            modules = [dict(r) for r in cur.fetchall()]

            # 3. Riwayat evaluasi
            cur = conn.execute(
                "SELECT evaluation_id, idempotency_key, score, accuracy, total_questions, correct_count, wrong_count, category_breakdown, detailed_answers, completed_at FROM student_evaluations WHERE user_email = ? ORDER BY completed_at DESC",
                (user_email,)
            )
            evals = []
            for r in cur.fetchall():
                ev = dict(r)
                if ev.get("category_breakdown"):
                    try:
                        ev["category_breakdown"] = json.loads(ev["category_breakdown"])
                    except Exception:
                        pass
                if ev.get("detailed_answers"):
                    try:
                        ev["detailed_answers"] = json.loads(ev["detailed_answers"])
                    except Exception:
                        pass
                evals.append(ev)

            # 4. Runner stats & sessions
            cur = conn.execute("SELECT * FROM student_runner_stats WHERE user_email = ?", (user_email,))
            r_stats = cur.fetchone()
            runner_stats = dict(r_stats) if r_stats else None

            cur = conn.execute(
                "SELECT session_id, level, score, coins, distance, answered, correct, accuracy, mistakes_count, created_at FROM student_runner_sessions WHERE user_email = ? ORDER BY created_at DESC LIMIT 50",
                (user_email,)
            )
            runner_sessions = [dict(r) for r in cur.fetchall()]

            # 5. Linimasa aktivitas pembelajaran (termasuk percakapan NORA)
            cur = conn.execute(
                "SELECT activity_id, activity_type, module_or_feature_id, metadata_json, created_at FROM learning_activities WHERE user_email = ? ORDER BY created_at DESC LIMIT 100",
                (user_email,)
            )
            activities = []
            for r in cur.fetchall():
                act = dict(r)
                if act.get("metadata_json"):
                    try:
                        act["metadata"] = json.loads(act["metadata_json"])
                    except Exception:
                        act["metadata"] = act["metadata_json"]
                else:
                    act["metadata"] = None
                activities.append(act)

        return {
            "user": user_dict,
            "is_official_research_subject": user_dict["subject_id"] in ("S-001", "S-002"),
            "modules": modules,
            "evaluations": evals,
            "runner_stats": runner_stats,
            "runner_sessions": runner_sessions,
            "activities": activities,
        }


# Aliases for explicit domain repository naming
ResearchSubjectRepository = ResearchRepository
ResearchSessionRepository = ResearchRepository
CognitiveLoadRepository = ResearchRepository

