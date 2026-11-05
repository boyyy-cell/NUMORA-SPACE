from typing import List, Dict, Optional
from datetime import datetime
from backend.app.schemas.research import (
    ResearchSubject,
    ResearchSessionLog,
    CognitiveLoadInstrumentStatus,
)


class ResearchStore:
    def __init__(self):
        # S-001 dan S-002 adalah label anonim protokol riset komparatif 2 subjek,
        # BUKAN klaim bukti partisipasi empiris yang telah terlaksana.
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
                total_sessions_logged=0,
                data_source="PROTOCOL_TEMPLATE",
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
                total_sessions_logged=0,
                data_source="PROTOCOL_TEMPLATE",
            ),
        }

        # Sesi di bawah adalah DEMO_SEED (template simulasi) untuk pengujian UI dashboard,
        # secara eksplisit BUKAN data riil hasil observasi siswa lapangan.
        self._sessions: List[ResearchSessionLog] = [
            ResearchSessionLog(
                session_id="SEED-001-ORIENT",
                subject_id="S-001",
                timestamp=datetime.utcnow(),
                module_id="mod_variables",
                concept_studied="Wadah Nilai Variabel (Template Simulasi)",
                duration_minutes=25.0,
                hints_used=2,
                misconceptions_detected=["Contoh: Awalnya menganggap x hanya inisial nama"],
                notes="Data simulasi antarmuka — belum ada sesi riil lapangan.",
                data_source="DEMO_SEED"
            ),
            ResearchSessionLog(
                session_id="SEED-002-ORIENT",
                subject_id="S-002",
                timestamp=datetime.utcnow(),
                module_id="mod_variables",
                concept_studied="Laboratorium Visual 2D Variabel x (Template Simulasi)",
                duration_minutes=22.5,
                hints_used=1,
                misconceptions_detected=["Contoh: Eksplorasi bilangan desimal pada wadah x"],
                notes="Data simulasi antarmuka — belum ada sesi riil lapangan.",
                data_source="DEMO_SEED"
            )
        ]

        self._instrument_status = CognitiveLoadInstrumentStatus(
            framework_name="Leppink et al. Multidimensional Cognitive Load Scale",
            intrinsic_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            extraneous_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            germane_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            scale_type="10-Point Likert Scale (0 = Sangat Ringan, 10 = Sangat Berat)",
            verification_status="Instrumen belum diisi oleh subjek penelitian riil.",
            data_source="INSTRUMENT_SPECIFICATION"
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
