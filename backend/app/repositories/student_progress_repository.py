"""
NUMORA Space — Student Module Progress Repository
Manages persistent module progression with conflict resolution (union-set / highest completion).
"""
import time
from typing import List, Optional, Dict, Any
from backend.app.repositories.base import BaseRepository


class StudentProgressRepository(BaseRepository):
    def get_all_progress(self, user_email: str) -> List[Dict[str, Any]]:
        query = """
            SELECT id, user_email, module_id, status, slider_explored, 
                   time_spent_seconds, completed_at, updated_at
            FROM student_module_progress
            WHERE user_email = ?
            ORDER BY module_id ASC
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email,))
            return [dict(row) for row in cursor.fetchall()]

    def get_module_progress(self, user_email: str, module_id: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT id, user_email, module_id, status, slider_explored, 
                   time_spent_seconds, completed_at, updated_at
            FROM student_module_progress
            WHERE user_email = ? AND module_id = ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (user_email, module_id))
            row = cursor.fetchone()
            return dict(row) if row else None

    def upsert_progress(
        self,
        user_email: str,
        module_id: str,
        status: str,
        slider_explored: int = 0,
        time_spent_seconds: int = 0,
        completed_at: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Menyimpan atau memperbarui progres modul dengan aturan:
        - Status 'COMPLETED' tidak boleh diturunkan kembali ke 'IN_PROGRESS' atau 'NOT_STARTED'.
        - slider_explored mengambil nilai tertinggi (MAX).
        - time_spent_seconds diakumulasi atau diambil nilai tertinggi.
        - completed_at mempertahankan timestamp penyelesaian pertama kali.
        """
        valid_statuses = ("NOT_STARTED", "IN_PROGRESS", "COMPLETED")
        if status not in valid_statuses:
            status = "IN_PROGRESS"

        now = int(time.time())
        if status == "COMPLETED" and not completed_at:
            completed_at = now

        with self.transaction() as conn:
            # Periksa data modul eksisting
            cursor = conn.execute(
                "SELECT status, slider_explored, time_spent_seconds, completed_at FROM student_module_progress WHERE user_email = ? AND module_id = ?",
                (user_email, module_id)
            )
            existing = cursor.fetchone()

            if existing:
                # Terapkan aturan resolusi konkurensi / union
                final_status = "COMPLETED" if (existing["status"] == "COMPLETED" or status == "COMPLETED") else status
                final_slider = max(int(existing["slider_explored"]), int(slider_explored))
                final_time = max(int(existing["time_spent_seconds"]), int(time_spent_seconds))
                final_completed_at = existing["completed_at"] or completed_at

                conn.execute(
                    """
                    UPDATE student_module_progress
                    SET status = ?, slider_explored = ?, time_spent_seconds = ?, 
                        completed_at = ?, updated_at = ?
                    WHERE user_email = ? AND module_id = ?
                    """,
                    (final_status, final_slider, final_time, final_completed_at, now, user_email, module_id)
                )
            else:
                conn.execute(
                    """
                    INSERT INTO student_module_progress 
                        (user_email, module_id, status, slider_explored, time_spent_seconds, completed_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (user_email, module_id, status, slider_explored, time_spent_seconds, completed_at, now)
                )

        return self.get_module_progress(user_email, module_id)

    def batch_upsert_progress(
        self,
        user_email: str,
        items: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Menerapkan beberapa item progres sekaligus dalam satu transaksi atomik.
        """
        with self.transaction() as conn:
            for item in items:
                module_id = item["module_id"]
                status = item.get("status", "IN_PROGRESS")
                slider_explored = int(item.get("slider_explored", 0))
                time_spent_seconds = int(item.get("time_spent_seconds", 0))
                completed_at = item.get("completed_at")
                now = int(time.time())

                cursor = conn.execute(
                    "SELECT status, slider_explored, time_spent_seconds, completed_at FROM student_module_progress WHERE user_email = ? AND module_id = ?",
                    (user_email, module_id)
                )
                existing = cursor.fetchone()

                if existing:
                    final_status = "COMPLETED" if (existing["status"] == "COMPLETED" or status == "COMPLETED") else status
                    final_slider = max(int(existing["slider_explored"]), slider_explored)
                    final_time = max(int(existing["time_spent_seconds"]), time_spent_seconds)
                    final_completed_at = existing["completed_at"] or completed_at

                    conn.execute(
                        """
                        UPDATE student_module_progress
                        SET status = ?, slider_explored = ?, time_spent_seconds = ?, 
                            completed_at = ?, updated_at = ?
                        WHERE user_email = ? AND module_id = ?
                        """,
                        (final_status, final_slider, final_time, final_completed_at, now, user_email, module_id)
                    )
                else:
                    if status == "COMPLETED" and not completed_at:
                        completed_at = now
                    conn.execute(
                        """
                        INSERT INTO student_module_progress 
                            (user_email, module_id, status, slider_explored, time_spent_seconds, completed_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (user_email, module_id, status, slider_explored, time_spent_seconds, completed_at, now)
                    )

        return self.get_all_progress(user_email)
