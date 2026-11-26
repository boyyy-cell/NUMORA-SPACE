"""
NUMORA Space — Learning Activity Repository
Append-only audit trail of learning activities (modules, lab experiments, NORA AI, evaluation, runner).
"""
import json
import time
import uuid
from typing import List, Optional, Dict, Any
from backend.app.repositories.base import BaseRepository


class LearningActivityRepository(BaseRepository):
    VALID_TYPES = (
        "LOGIN",
        "LOGOUT",
        "SESSION_START",
        "SESSION_END",
        "MODULE_VIEW",
        "MODULE_COMPLETE",
        "QUESTION_ANSWER",
        "LAB_EXPERIMENT",
        "NORA_CHAT",
        "EVALUATION_START",
        "EVALUATION_SUBMIT",
        "RUNNER_PLAY",
    )

    def record_activity(
        self,
        user_email: str,
        activity_type: str,
        module_or_feature_id: str,
        metadata: Optional[Any] = None,
        created_at: Optional[int] = None,
        activity_id: Optional[str] = None
    ) -> Dict[str, Any]:
        clean_email = (user_email or "").strip().lower()
        normalized_type = str(activity_type).strip().upper()
        if normalized_type not in self.VALID_TYPES:
            normalized_type = "MODULE_VIEW"

        act_id = activity_id or f"act_{uuid.uuid4().hex}"
        timestamp = created_at or int(time.time())

        meta_str = None
        if metadata is not None:
            meta_str = metadata if isinstance(metadata, str) else json.dumps(metadata)

        query = """
            INSERT INTO learning_activities
                (activity_id, user_email, activity_type, module_or_feature_id, metadata_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        with self.get_connection() as conn:
            conn.execute(
                query,
                (act_id, clean_email, normalized_type, module_or_feature_id, meta_str, timestamp)
            )

        return {
            "activity_id": act_id,
            "user_email": clean_email,
            "activity_type": normalized_type,
            "module_or_feature_id": module_or_feature_id,
            "metadata_json": meta_str,
            "created_at": timestamp,
        }

    def get_activities(
        self,
        user_email: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        clean_email = (user_email or "").strip().lower()
        query = """
            SELECT activity_id, user_email, activity_type, module_or_feature_id,
                   metadata_json, created_at
            FROM learning_activities
            WHERE user_email = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """
        with self.get_connection() as conn:
            cursor = conn.execute(query, (clean_email, limit, offset))
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = dict(row)
                if item.get("metadata_json"):
                    try:
                        item["metadata"] = json.loads(item["metadata_json"])
                    except Exception:
                        item["metadata"] = item["metadata_json"]
                else:
                    item["metadata"] = None
                results.append(item)
            return results

    def get_all_activities(
        self,
        activity_type: Optional[str] = None,
        user_email: Optional[str] = None,
        limit: int = 200,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        conditions = []
        params = []
        if user_email:
            conditions.append("a.user_email = ?")
            params.append(user_email.strip().lower())
        if activity_type:
            conditions.append("a.activity_type = ?")
            params.append(activity_type.upper())

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        query = f"""
            SELECT a.activity_id, a.user_email, a.activity_type, a.module_or_feature_id,
                   a.metadata_json, a.created_at,
                   u.name AS user_name, u.subject_id, u.role AS user_role
            FROM learning_activities a
            LEFT JOIN users u ON u.email = a.user_email
            {where_clause}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])

        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = dict(row)
                if item.get("metadata_json"):
                    try:
                        item["metadata"] = json.loads(item["metadata_json"])
                    except Exception:
                        item["metadata"] = item["metadata_json"]
                else:
                    item["metadata"] = None
                results.append(item)
            return results

    def delete_activities_for_user(self, user_email: str) -> int:
        clean_email = (user_email or "").strip().lower()
        with self.get_connection() as conn:
            cur = conn.execute("DELETE FROM learning_activities WHERE user_email = ?", (clean_email,))
            return cur.rowcount
