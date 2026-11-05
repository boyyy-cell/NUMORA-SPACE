from typing import List, Dict, Optional
from datetime import datetime
from backend.app.schemas.research import (
    ResearchSubject,
    ResearchSessionLog,
    CognitiveLoadInstrumentStatus,
)


class ResearchStore:
    def __init__(self):
        # Strictly 2 subjects for the experimental small-scale study protocol
        self._subjects: Dict[str, ResearchSubject] = {
            "S-001": ResearchSubject(
                subject_id="S-001",
                group="Control (Tatap Muka Langsung bersama Peneliti)",
                role_description="Siswa SMP Kelas VII belajar konsep aljabar secara tatap muka konvensional terarah bersama peneliti.",
                grade="SMP Kelas VII",
                active_module="Modul 02: Understanding Coefficients",
                pretest_status="Belum Dilaksanakan (Scheduled)",
                pretest_score=None,
                posttest_status="Belum Dilaksanakan (Scheduled)",
                posttest_score=None,
                cognitive_load_status="NOT CONFIGURED (Belum Diukur)",
                total_sessions_logged=1,
            ),
            "S-002": ResearchSubject(
                subject_id="S-002",
                group="Experimental (Pembelajaran Berbantuan NUMORA Space)",
                role_description="Siswa SMP Kelas VII belajar konsep aljabar secara mandiri terpandu melalui platform NUMORA Space & NORA AI.",
                grade="SMP Kelas VII",
                active_module="Modul 02: Understanding Coefficients",
                pretest_status="Belum Dilaksanakan (Scheduled)",
                pretest_score=None,
                posttest_status="Belum Dilaksanakan (Scheduled)",
                posttest_score=None,
                cognitive_load_status="NOT CONFIGURED (Belum Diukur)",
                total_sessions_logged=1,
            ),
        }

        self._sessions: List[ResearchSessionLog] = [
            ResearchSessionLog(
                session_id="SES-001-ORIENT",
                subject_id="S-001",
                timestamp=datetime.utcnow(),
                module_id="mod_variables",
                concept_studied="Wadah Nilai Variabel (Tatap Muka)",
                duration_minutes=25.0,
                hints_used=2,
                misconceptions_detected=["Awalnya menganggap x hanya inisial nama"],
                notes="Sesi orientasi konsep dasar bersama peneliti."
            ),
            ResearchSessionLog(
                session_id="SES-002-ORIENT",
                subject_id="S-002",
                timestamp=datetime.utcnow(),
                module_id="mod_variables",
                concept_studied="Laboratorium Visual 2D Variabel x",
                duration_minutes=22.5,
                hints_used=1,
                misconceptions_detected=["Mencoba memasukkan bilangan desimal pada wadah x"],
                notes="Siswa mengeksplorasi slider nilai x secara mandiri di NUMORA Space."
            )
        ]

        self._instrument_status = CognitiveLoadInstrumentStatus(
            framework_name="Leppink et al. Multidimensional Cognitive Load Scale",
            intrinsic_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            extraneous_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            germane_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            scale_type="10-Point Likert Scale (0 = Sangat Ringan, 10 = Sangat Berat)",
            verification_status="Instrumen sedang diverifikasi untuk konteks siswa SMP kelas VII."
        )

    def get_all_subjects(self) -> List[ResearchSubject]:
        return list(self._subjects.values())

    def get_subject_by_id(self, subject_id: str) -> Optional[ResearchSubject]:
        return self._subjects.get(subject_id)

    def get_sessions(self, subject_id: Optional[str] = None) -> List[ResearchSessionLog]:
        if subject_id:
            return [s for s in self._sessions if s.subject_id == subject_id]
        return self._sessions

    def get_cognitive_load_instrument_status(self) -> CognitiveLoadInstrumentStatus:
        return self._instrument_status


research_store = ResearchStore()

