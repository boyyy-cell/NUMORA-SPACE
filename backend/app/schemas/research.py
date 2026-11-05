from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ResearchSubject(BaseModel):
    subject_id: str = Field(..., example="S-001")
    group: str = Field(..., example="Control (Direct Teaching)")
    role_description: str
    grade: str = "SMP Kelas VII"
    active_module: str
    pretest_status: str = Field(..., example="Scheduled")
    pretest_score: Optional[float] = None
    posttest_status: str = Field(..., example="Scheduled")
    posttest_score: Optional[float] = None
    cognitive_load_status: str = Field(..., example="NOT CONFIGURED")
    total_sessions_logged: int = 0
    data_source: str = Field(default="PROTOCOL_TEMPLATE", description="Kategori data: PROTOCOL_TEMPLATE | ACTUAL_EMPIRICAL")


class ResearchSessionLog(BaseModel):
    session_id: str
    subject_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    module_id: str
    concept_studied: str
    duration_minutes: float
    hints_used: int
    misconceptions_detected: List[str] = []
    notes: Optional[str] = None
    data_source: str = Field(default="DEMO_SEED", description="Kategori data: DEMO_SEED (Simulasi) | ACTUAL_EMPIRICAL (Data Riil Lapangan)")


class CognitiveLoadInstrumentStatus(BaseModel):
    framework_name: str = "Leppink Multidimensional Cognitive Load Scale"
    intrinsic_load_status: str = "NOT CONFIGURED (Awaiting Empirical Session)"
    extraneous_load_status: str = "NOT CONFIGURED (Awaiting Empirical Session)"
    germane_load_status: str = "NOT CONFIGURED (Awaiting Empirical Session)"
    scale_type: str = "0-10 Likert Scale"
    verification_status: str = "Protocol Awaiting Researcher Execution"
    data_source: str = "INSTRUMENT_SPECIFICATION"
