"""
NUMORA Space — Pydantic Schemas for Student Data Persistence & Sync
"""
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


# ----------------------------------------------------
# 1. Progres Modul
# ----------------------------------------------------
class ModuleProgressItem(BaseModel):
    module_id: str
    status: str = Field(..., description="'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'")
    slider_explored: int = Field(default=0, ge=0)
    time_spent_seconds: int = Field(default=0, ge=0)
    completed_at: Optional[int] = None
    updated_at: Optional[int] = None


class ModuleProgressUpdateRequest(BaseModel):
    module_id: str = Field(..., min_length=1)
    status: str = Field(default="IN_PROGRESS", description="'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'")
    slider_explored: int = Field(default=0, ge=0)
    time_spent_seconds: int = Field(default=0, ge=0)
    completed_at: Optional[int] = None


# ----------------------------------------------------
# 2. Evaluasi 10 Soal
# ----------------------------------------------------
class EvaluationSubmitRequest(BaseModel):
    idempotency_key: str = Field(..., min_length=1, max_length=128)
    score: float = Field(..., ge=0.0, le=100.0)
    accuracy: float = Field(..., ge=0.0, le=100.0)
    total_questions: int = Field(default=10, ge=1)
    correct_count: int = Field(..., ge=0)
    wrong_count: int = Field(..., ge=0)
    category_breakdown: Any = Field(default_factory=dict)
    detailed_answers: Any = Field(default_factory=list)
    completed_at: Optional[int] = None


class EvaluationRecord(BaseModel):
    evaluation_id: str
    idempotency_key: str
    user_email: str
    attempt_number: int
    score: float
    accuracy: float
    total_questions: int
    correct_count: int
    wrong_count: int
    category_breakdown: Any
    detailed_answers: Any
    completed_at: int


# ----------------------------------------------------
# 3. NUMORA RUN Stats & Sessions
# ----------------------------------------------------
class RunnerStatsResponse(BaseModel):
    user_email: str
    high_score_beginner: int = 0
    high_score_intermediate: int = 0
    high_score_advanced: int = 0
    high_score_expert: int = 0
    total_games: int = 0
    total_coins: int = 0
    total_distance: int = 0
    total_math_answered: int = 0
    total_math_correct: int = 0
    updated_at: int = 0


class RunnerSessionSubmitRequest(BaseModel):
    idempotency_key: str = Field(..., min_length=1, max_length=128)
    level: str = Field(..., description="'beginner' | 'intermediate' | 'advanced' | 'expert'")
    score: int = Field(..., ge=0)
    coins: int = Field(..., ge=0)
    distance: int = Field(..., ge=0)
    answered: int = Field(..., ge=0)
    correct: int = Field(..., ge=0)
    accuracy: float = Field(..., ge=0.0, le=100.0)
    mistakes_count: int = Field(default=0, ge=0)
    created_at: Optional[int] = None


class RunnerSessionRecord(BaseModel):
    session_id: str
    idempotency_key: str
    user_email: str
    level: str
    score: int
    coins: int
    distance: int
    answered: int
    correct: int
    accuracy: float
    mistakes_count: int
    created_at: int


class RunnerSessionSubmitResponse(BaseModel):
    session: Dict[str, Any]
    stats: Dict[str, Any]
    is_new_high: bool
    deduplicated: bool = False


# ----------------------------------------------------
# 4. Learning Activity
# ----------------------------------------------------
class ActivityLogRequest(BaseModel):
    activity_type: str = Field(
        ...,
        description="'LOGIN' | 'LOGOUT' | 'MODULE_VIEW' | 'MODULE_COMPLETE' | 'LAB_EXPERIMENT' | 'NORA_CHAT' | 'EVALUATION_SUBMIT' | 'RUNNER_PLAY'"
    )
    module_or_feature_id: str = Field(..., min_length=1)
    metadata: Optional[Any] = None


class ActivityRecord(BaseModel):
    activity_id: str
    user_email: str
    activity_type: str
    module_or_feature_id: str
    metadata: Optional[Any] = None
    created_at: int


# ----------------------------------------------------
# 5. Full Sync & Bootstrap Migration
# ----------------------------------------------------
class StudentFullSyncResponse(BaseModel):
    user_email: str
    server_time: int
    progress: List[Dict[str, Any]]
    evaluations: List[Dict[str, Any]]
    runner_stats: Dict[str, Any]
    runner_sessions: List[Dict[str, Any]]
    activities: List[Dict[str, Any]]


class StudentBootstrapMigrationRequest(BaseModel):
    modules: Optional[List[Any]] = Field(default_factory=list)
    evaluations: Optional[List[Any]] = Field(default_factory=list)
    runner: Optional[Dict[str, Any]] = Field(default_factory=dict)


class StudentBootstrapMigrationResponse(BaseModel):
    status: str = "VERIFIED_MIGRATED"
    synced_modules: int
    synced_evaluations: int
    synced_runner_sessions: int
    current_state: StudentFullSyncResponse
