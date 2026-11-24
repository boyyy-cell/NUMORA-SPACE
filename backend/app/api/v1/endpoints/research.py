import csv
import io
from fastapi import APIRouter, HTTPException, Depends, status, Query, Response
from typing import List, Optional, Dict, Any
from backend.app.schemas.research import (
    ResearchSubject,
    ResearchSessionLog,
    CreateResearchSessionRequest,
    CognitiveLoadInstrumentStatus,
    ResearchAnalyticsResponse,
)
from backend.app.repositories.research_repository import ResearchRepository
from backend.app.services.student_sync_service import student_sync_service
from backend.app.core.dependencies import require_researcher

# Seluruh endpoint penelitian terproteksi Role-Based Access Control (RBAC): hanya peran 'researcher' (P-001)
router = APIRouter(dependencies=[Depends(require_researcher)])
research_repo = ResearchRepository()


@router.get(
    "/subjects",
    response_model=List[ResearchSubject],
    summary="List Small-Scale Research Subjects"
)
async def get_subjects():
    """
    Mengembalikan subjek protokol riset S-001 (Control) dan S-002 (Experimental).
    Berasal langsung dari tabel research_subjects SQLite tanpa fabrikasi data.
    """
    return research_repo.get_all_subjects()


@router.get(
    "/subjects/{subject_id}",
    response_model=ResearchSubject,
    summary="Get Specific Research Subject"
)
async def get_subject_by_id(subject_id: str):
    subject = research_repo.get_subject_by_id(subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subjek penelitian '{subject_id}' tidak ditemukan."
        )
    return subject


@router.get(
    "/sessions",
    response_model=List[ResearchSessionLog],
    summary="Get Verified Research Sessions"
)
async def get_sessions(subject_id: Optional[str] = None):
    """
    Mengembalikan log sesi penelitian terverifikasi untuk S-001 atau S-002.
    """
    return research_repo.get_sessions(subject_id=subject_id)


@router.post(
    "/sessions",
    response_model=ResearchSessionLog,
    summary="Record Verified Research Session"
)
async def create_session(payload: CreateResearchSessionRequest):
    """
    Mencatat sesi penelitian terverifikasi baru oleh Peneliti Utama (P-001).
    """
    subject = research_repo.get_subject_by_id(payload.subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subjek '{payload.subject_id}' tidak terdaftar dalam protokol penelitian."
        )

    session = research_repo.record_session(
        subject_id=payload.subject_id,
        session_date=payload.session_date,
        module_id=payload.module_id,
        concept_studied=payload.concept_studied,
        duration_minutes=payload.duration_minutes,
        hints_used=payload.hints_used,
        misconceptions_detected=payload.misconceptions_detected,
        researcher_notes=payload.researcher_notes,
        verified_by_researcher=True,
    )
    return session


@router.get(
    "/analytics",
    response_model=ResearchAnalyticsResponse,
    summary="Get Authentic Research Analytics"
)
async def get_analytics():
    """
    Mengembalikan ringkasan analitik penelitian berbasis data riil database.
    Menampilkan status jujur, tanpa angka simulasi buatan.
    """
    return research_repo.get_analytics_summary()


@router.get(
    "/cognitive-load-status",
    response_model=CognitiveLoadInstrumentStatus,
    summary="Leppink Cognitive Load Status"
)
async def get_cognitive_load_status():
    """
    Mengembalikan status instrumen beban kognitif Leppink et al.
    Jika belum ada pengukuran lapangan, status jujur NOT CONFIGURED ditampilkan.
    """
    records = research_repo.get_cognitive_load_records()
    if not records:
        return CognitiveLoadInstrumentStatus(
            framework_name="Leppink et al. Multidimensional Cognitive Load Scale",
            intrinsic_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            extraneous_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            germane_load_status="NOT CONFIGURED (Menunggu Sesi Pengukuran Lapangan)",
            scale_type="10-Point Likert Scale (0 = Sangat Ringan, 10 = Sangat Berat)",
            verification_status="Instrumen belum diisi oleh subjek penelitian riil.",
            data_source="INSTRUMENT_SPECIFICATION"
        )
    return CognitiveLoadInstrumentStatus(
        framework_name="Leppink et al. Multidimensional Cognitive Load Scale",
        intrinsic_load_status="ACTIVE",
        extraneous_load_status="ACTIVE",
        germane_load_status="ACTIVE",
        scale_type="10-Point Likert Scale (0 = Sangat Ringan, 10 = Sangat Berat)",
        verification_status=f"{len(records)} catatan pengukuran empiris tersimpan.",
        data_source="ACTUAL_EMPIRICAL"
    )


@router.get(
    "/cognitive-load",
    summary="List Cognitive Load Measurement Records"
)
async def get_cognitive_load_records(subject_id: Optional[str] = None):
    return {
        "status": "NOT CONFIGURED" if not research_repo.get_cognitive_load_records(subject_id) else "ACTIVE",
        "records": research_repo.get_cognitive_load_records(subject_id)
    }


@router.get(
    "/public-users",
    summary="List Registered Public Users Learning Progress",
    description="Mengembalikan rekap progres belajar, evaluasi, dan aktivitas seluruh pengguna publik dengan pemisahan eksplisit dari subjek penelitian resmi (S-001/S-002)."
)
async def get_public_users_summary():
    return research_repo.get_public_users_summary()


@router.get(
    "/users/{user_email}/dossier",
    summary="Get Detailed Student Learning Dossier",
    description="Mengembalikan rekam jejak lengkap evaluasi, progres modul, riwayat runner, dan aktivitas pembelajaran seorang pengguna untuk keperluan audit riset."
)
async def get_user_dossier(user_email: str):
    dossier = research_repo.get_user_detailed_dossier(user_email)
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pengguna dengan email '{user_email}' tidak ditemukan."
        )
    return dossier


@router.get(
    "/activities",
    summary="Audit Trail of All Learning Activities",
    description="Mengembalikan linimasa aktivitas pembelajaran seluruh pengguna (modul, evaluasi, NORA AI, sesi login/logout, runner)."
)
async def get_all_activities(
    activity_type: Optional[str] = Query(default=None),
    user_email: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    return student_sync_service.activity_repo.get_all_activities(
        activity_type=activity_type,
        user_email=user_email,
        limit=limit,
        offset=offset
    )


@router.get(
    "/export/csv",
    summary="Export Actual Research & Learning Data (CSV)",
    description="Mengekspor seluruh data penelitian resmi dan aktivitas belajar pengguna publik ke dalam format CSV aktual."
)
async def export_csv():
    users_data = research_repo.get_public_users_summary()
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header CSV
    writer.writerow([
        "Cohort_Type",
        "Is_Official_Research_Subject",
        "Subject_or_User_ID",
        "Name",
        "Email",
        "Role",
        "Grade",
        "Auth_Provider",
        "Modules_Completed",
        "Evaluations_Count",
        "Latest_Evaluation_Score",
        "Max_Evaluation_Score",
        "Runner_Games",
        "Runner_Coins",
        "Runner_Distance",
        "Runner_High_Score",
        "Total_Activities_Count",
        "Registered_At",
        "Last_Active_At"
    ])

    for u in users_data:
        writer.writerow([
            u.get("cohort_type", ""),
            "YES" if u.get("is_official_research_subject") else "NO",
            u.get("subject_id", ""),
            u.get("name", ""),
            u.get("email", ""),
            u.get("role", ""),
            u.get("grade", ""),
            u.get("auth_provider", ""),
            u.get("modules_completed", 0),
            u.get("evaluations_count", 0),
            u.get("latest_evaluation_score", ""),
            u.get("max_evaluation_score", ""),
            u.get("runner_games", 0),
            u.get("runner_coins", 0),
            u.get("runner_distance", 0),
            u.get("runner_high_score", 0),
            u.get("activities_count", 0),
            u.get("registered_at", ""),
            u.get("last_active_at", "")
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=numora_research_and_learning_data.csv"}
    )


@router.get(
    "/export/json",
    summary="Export Actual Research & Learning Data (JSON)",
    description="Mengekspor rekap analitik, subjek riset resmi (S-001 & S-002), dan data pengguna publik ke format JSON aktual."
)
async def export_json():
    return {
        "official_research_cohort": {
            "description": "Protokol Penelitian Terbatas Resmi (Tepat 2 Subjek)",
            "subjects": research_repo.get_all_subjects(),
            "sessions": research_repo.get_sessions(),
            "cognitive_load_status": research_repo.get_cognitive_load_records()
        },
        "public_learning_users": {
            "description": "Rekap Aktivitas Pembelajaran Siswa & Pengguna Publik (Bukan Subjek Riset Resmi)",
            "users": research_repo.get_public_users_summary()
        },
        "analytics_summary": research_repo.get_analytics_summary()
    }
