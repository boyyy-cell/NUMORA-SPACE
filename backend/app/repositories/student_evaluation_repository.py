"""
NUMORA Space — Student Evaluation Repository
Append-only evaluation storage with strict per-user idempotency key enforcement.
"""
import json
import time
import uuid
from typing import List, Optional, Dict, Any
from backend.app.repositories.base import BaseRepository


class StudentEvaluationRepository(BaseRepository):
    def get_evaluations(self, user_email: str) -> List[Dict[str, Any]]:
        query = """
            SELECT evaluation_id, idempotency_key, user_email, attempt_number,
                   score, accuracy, total_questions, correct_count, wrong_count,
                   category_breakdown, detailed_answers, completed_at
            FROM student_evaluations
            WHERE user_email = ?
            ORDER BY completed_at ASC
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email,))
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = dict(row)
                if isinstance(item.get("category_breakdown"), str):
                    try:
                        item["category_breakdown"] = json.loads(item["category_breakdown"])
                    except Exception:
                        pass
                if isinstance(item.get("detailed_answers"), str):
                    try:
                        item["detailed_answers"] = json.loads(item["detailed_answers"])
                    except Exception:
                        pass
                results.append(item)
            return results

    def get_evaluation_by_id(self, user_email: str, evaluation_id: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT evaluation_id, idempotency_key, user_email, attempt_number,
                   score, accuracy, total_questions, correct_count, wrong_count,
                   category_breakdown, detailed_answers, completed_at
            FROM student_evaluations
            WHERE user_email = ? AND evaluation_id = ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email, evaluation_id))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            if isinstance(item.get("category_breakdown"), str):
                try:
                    item["category_breakdown"] = json.loads(item["category_breakdown"])
                except Exception:
                    pass
            if isinstance(item.get("detailed_answers"), str):
                try:
                    item["detailed_answers"] = json.loads(item["detailed_answers"])
                except Exception:
                    pass
            return item

    def get_evaluation_by_idempotency_key(self, user_email: str, idempotency_key: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT evaluation_id, idempotency_key, user_email, attempt_number,
                   score, accuracy, total_questions, correct_count, wrong_count,
                   category_breakdown, detailed_answers, completed_at
            FROM student_evaluations
            WHERE user_email = ? AND idempotency_key = ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email, idempotency_key))
            row = cursor.fetchone()
            if not row:
                return None
            item = dict(row)
            if isinstance(item.get("category_breakdown"), str):
                try:
                    item["category_breakdown"] = json.loads(item["category_breakdown"])
                except Exception:
                    pass
            if isinstance(item.get("detailed_answers"), str):
                try:
                    item["detailed_answers"] = json.loads(item["detailed_answers"])
                except Exception:
                    pass
            return item

    def save_evaluation(
        self,
        user_email: str,
        idempotency_key: str,
        score: float,
        accuracy: float,
        total_questions: int,
        correct_count: int,
        wrong_count: int,
        category_breakdown: Any,
        detailed_answers: Any,
        completed_at: Optional[int] = None,
        evaluation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Menyimpan hasil evaluasi ke tabel student_evaluations secara atomik dan idempoten.
        Jika idempotency_key telah terdaftar untuk user_email ini, kembalikan data yang tersimpan.
        """
        # Cek apakah idempotency_key sudah pernah diproses
        existing = self.get_evaluation_by_idempotency_key(user_email, idempotency_key)
        if existing:
            return existing

        eval_id = evaluation_id or f"eval_{uuid.uuid4().hex}"
        timestamp = completed_at or int(time.time())

        # Serialize JSON fields jika bukan string
        cat_json = (
            category_breakdown
            if isinstance(category_breakdown, str)
            else json.dumps(category_breakdown)
        )
        det_json = (
            detailed_answers
            if isinstance(detailed_answers, str)
            else json.dumps(detailed_answers)
        )

        with self.transaction() as conn:
            # Hitung attempt number selanjutnya secara atomik
            cursor = conn.execute(
                "SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt FROM student_evaluations WHERE user_email = ?",
                (user_email,)
            )
            next_attempt = cursor.fetchone()["next_attempt"]

            conn.execute(
                """
                INSERT INTO student_evaluations
                    (evaluation_id, idempotency_key, user_email, attempt_number, score,
                     accuracy, total_questions, correct_count, wrong_count,
                     category_breakdown, detailed_answers, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_email, idempotency_key) DO NOTHING
                """,
                (
                    eval_id,
                    idempotency_key,
                    user_email,
                    next_attempt,
                    float(score),
                    float(accuracy),
                    int(total_questions),
                    int(correct_count),
                    int(wrong_count),
                    cat_json,
                    det_json,
                    timestamp,
                )
            )

        return self.get_evaluation_by_idempotency_key(user_email, idempotency_key) or self.get_evaluation_by_id(user_email, eval_id)
