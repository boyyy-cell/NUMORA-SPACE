from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone


class ResearchSubject(BaseModel):
    subject_id: str = Field(..., json_schema_extra={"example": "S-001"})
    group: str = Field(..., json_schema_extra={"example": "Control (Direct Teaching)"})
    role_description: str
    grade: str = "SMP Kelas VII"
    active_module: str
    pretest_status: str = Field(..., json_schema_extra={"example": "Scheduled"})
    pretest_score: Optional[float] = None
    posttest_status: str = Field(..., json_schema_extra={"example": "Scheduled"})
    posttest_score: Optional[float] = None
    cognitive_load_status: str = Field(..., json_schema_extra={"example": "NOT CONFIGURED"})
    total_sessions_logged: int = 0
    data_source: str = Field(default="PROTOCOL_TEMPLATE", description="Kategori data: PROTOCOL_TEMPLATE | ACTUAL_EMPIRICAL")


class ResearchSessionLog(BaseModel):
    session_id: str
    subject_id: str
    session_date: Optional[str] = None
    module_id: str
    concept_studied: str
    duration_minutes: float
    hints_used: int = 0
    misconceptions_detected: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    verified_by_researcher: bool = True
    data_source: str = Field(default="ACTUAL_EMPIRICAL", description="Kategori data: ACTUAL_EMPIRICAL (Data Riil Lapangan)")


class CreateResearchSessionRequest(BaseModel):
    subject_id: str = Field(..., description="'S-001' atau 'S-002'")
    session_date: str = Field(..., description="Format YYYY-MM-DD")
    module_id: str
    concept_studied: str
    duration_minutes: float = Field(..., gt=0)
    hints_used: int = Field(default=0, ge=0)
    misconceptions_detected: List[str] = Field(default_factory=list)
    researcher_notes: Optional[str] = None


class CognitiveLoadInstrumentStatus(BaseModel):
    framework_name: str = "Leppink Multidimensional Cognitive Load Scale"
    intrinsic_load_status: str = "NOT CONFIGURED (Awaiting Empirical Session)"
    extraneous_load_status: str = "NOT CONFIGURED (Awaiting Empirical Session)"
    germane_load_status: str = "NOT CONFIGURED (Awaiting Empirical Session)"
    scale_type: str = "0-10 Likert Scale"
    verification_status: str = "Protocol Awaiting Researcher Execution"
    data_source: str = "INSTRUMENT_SPECIFICATION"


class ResearchAnalyticsResponse(BaseModel):
    total_subjects: int
    total_sessions: int
    total_duration_minutes: float
    total_learning_activities: Optional[int] = 0
    total_public_students: Optional[int] = 0
    total_modules_completed: Optional[int] = 0
    total_evaluations: Optional[int] = 0
    average_evaluation_score: Optional[float] = None
    max_evaluation_score: Optional[float] = None
    s002_digital_learning: Dict[str, Any]
    cognitive_load_records_count: int
    cognitive_load_instrument_status: str
    protocol_compliance: Dict[str, Any]
