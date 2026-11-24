"""
NUMORA Space — Student Runner Repository
Atomic runner stats management, high-score preservation (MAX),
and append-only session logging with idempotency enforcement.
"""
import time
import uuid
from typing import List, Optional, Dict, Any
from backend.app.repositories.base import BaseRepository


class StudentRunnerRepository(BaseRepository):
    def get_stats(self, user_email: str) -> Dict[str, Any]:
        query = """
            SELECT user_email, high_score_beginner, high_score_intermediate,
                   high_score_advanced, high_score_expert, total_games,
                   total_coins, total_distance, total_math_answered,
                   total_math_correct, updated_at
            FROM student_runner_stats
            WHERE user_email = ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email,))
            row = cursor.fetchone()
            if row:
                return dict(row)

        # Return default zeroed stats if user has not played yet
        return {
            "user_email": user_email,
            "high_score_beginner": 0,
            "high_score_intermediate": 0,
            "high_score_advanced": 0,
            "high_score_expert": 0,
            "total_games": 0,
            "total_coins": 0,
            "total_distance": 0,
            "total_math_answered": 0,
            "total_math_correct": 0,
            "updated_at": int(time.time()),
        }

    def get_sessions(
        self,
        user_email: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = """
            SELECT session_id, idempotency_key, user_email, level, score,
                   coins, distance, answered, correct, accuracy, mistakes_count,
                   created_at
            FROM student_runner_sessions
            WHERE user_email = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email, limit, offset))
            return [dict(row) for row in cursor.fetchall()]

    def get_session_by_idempotency_key(
        self,
        user_email: str,
        idempotency_key: str
    ) -> Optional[Dict[str, Any]]:
        query = """
            SELECT session_id, idempotency_key, user_email, level, score,
                   coins, distance, answered, correct, accuracy, mistakes_count,
                   created_at
            FROM student_runner_sessions
            WHERE user_email = ? AND idempotency_key = ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email, idempotency_key))
            row = cursor.fetchone()
            return dict(row) if row else None

    def record_session(
        self,
        user_email: str,
        idempotency_key: str,
        level: str,
        score: int,
        coins: int,
        distance: int,
        answered: int,
        correct: int,
        accuracy: float,
        mistakes_count: int = 0,
        created_at: Optional[int] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Merekam satu sesi NUMORA RUN secara atomik dan idempoten:
        1. Cek idempotency_key. Jika sudah ada, jangan menduplikasi sesi atau menambah statistik.
        2. Masukkan ke student_runner_sessions.
        3. Perbarui student_runner_stats (high_score = MAX, akumulasi koin/jarak/jawaban).
        """
        valid_levels = ("beginner", "intermediate", "advanced", "expert")
        if level not in valid_levels:
            level = "beginner"

        # Cek duplikasi via idempotency_key
        existing_session = self.get_session_by_idempotency_key(user_email, idempotency_key)
        if existing_session:
            return {
                "session": existing_session,
                "stats": self.get_stats(user_email),
                "is_new_high": False,
                "deduplicated": True,
            }

        sess_id = session_id or f"run_{uuid.uuid4().hex}"
        timestamp = created_at or int(time.time())
        high_col = f"high_score_{level}"

        with self.transaction() as conn:
            # 1. Pastikan baris stats ada
            conn.execute(
                """
                INSERT INTO student_runner_stats 
                    (user_email, updated_at)
                VALUES (?, ?)
                ON CONFLICT(user_email) DO NOTHING
                """,
                (user_email, timestamp)
            )

            # Baca skor tertinggi lama untuk mendeteksi rekor baru
            cursor = conn.execute(
                f"SELECT {high_col} FROM student_runner_stats WHERE user_email = ?",
                (user_email,)
            )
            old_high = cursor.fetchone()[high_col]
            is_new_high = score > old_high

            # 2. Masukkan sesi
            conn.execute(
                """
                INSERT INTO student_runner_sessions
                    (session_id, idempotency_key, user_email, level, score,
                     coins, distance, answered, correct, accuracy, mistakes_count,
                     created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_email, idempotency_key) DO NOTHING
                """,
                (
                    sess_id,
                    idempotency_key,
                    user_email,
                    level,
                    int(score),
                    int(coins),
                    int(distance),
                    int(answered),
                    int(correct),
                    float(accuracy),
                    int(mistakes_count),
                    timestamp,
                )
            )

            # 3. Update statistik secara atomik
            update_sql = f"""
                UPDATE student_runner_stats
                SET {high_col} = MAX({high_col}, ?),
                    total_games = total_games + 1,
                    total_coins = total_coins + ?,
                    total_distance = total_distance + ?,
                    total_math_answered = total_math_answered + ?,
                    total_math_correct = total_math_correct + ?,
                    updated_at = ?
                WHERE user_email = ?
            """
            conn.execute(
                update_sql,
                (
                    int(score),
                    int(coins),
                    int(distance),
                    int(answered),
                    int(correct),
                    timestamp,
                    user_email,
                )
            )

        saved_session = self.get_session_by_idempotency_key(user_email, idempotency_key)
        return {
            "session": saved_session,
            "stats": self.get_stats(user_email),
            "is_new_high": is_new_high,
            "deduplicated": False,
        }

    def update_stats_delta(
        self,
        user_email: str,
        delta_games: int = 0,
        delta_coins: int = 0,
        delta_distance: int = 0,
        delta_answered: int = 0,
        delta_correct: int = 0,
        high_scores: Optional[Dict[str, int]] = None
    ) -> Dict[str, Any]:
        """
        Menyesuaikan statistik secara inkremental tanpa melalui sesi satuan (misal bootstrap import).
        """
        now = int(time.time())
        high_scores = high_scores or {}

        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO student_runner_stats (user_email, updated_at)
                VALUES (?, ?)
                ON CONFLICT(user_email) DO NOTHING
                """,
                (user_email, now)
            )

            conn.execute(
                """
                UPDATE student_runner_stats
                SET high_score_beginner = MAX(high_score_beginner, ?),
                    high_score_intermediate = MAX(high_score_intermediate, ?),
                    high_score_advanced = MAX(high_score_advanced, ?),
                    high_score_expert = MAX(high_score_expert, ?),
                    total_games = total_games + ?,
                    total_coins = total_coins + ?,
                    total_distance = total_distance + ?,
                    total_math_answered = total_math_answered + ?,
                    total_math_correct = total_math_correct + ?,
                    updated_at = ?
                WHERE user_email = ?
                """,
                (
                    int(high_scores.get("beginner", 0)),
                    int(high_scores.get("intermediate", 0)),
                    int(high_scores.get("advanced", 0)),
                    int(high_scores.get("expert", 0)),
                    int(delta_games),
                    int(delta_coins),
                    int(delta_distance),
                    int(delta_answered),
                    int(delta_correct),
                    now,
                    user_email,
                )
            )

        return self.get_stats(user_email)
