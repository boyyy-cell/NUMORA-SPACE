"""
NUMORA Space — Student Persistent Data Endpoints
Secured with JWT verification, anti-IDOR user extraction, and S-001 research control protection.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.core.dependencies import require_student_digital_access
from backend.app.schemas.student import (
    ModuleProgressItem,
    ModuleProgressUpdateRequest,
    EvaluationSubmitRequest,
    EvaluationRecord,
    RunnerStatsResponse,
    RunnerSessionSubmitRequest,
    RunnerSessionSubmitResponse,
    RunnerSessionRecord,
    ActivityLogRequest,
    ActivityRecord,
    StudentFullSyncResponse,
    StudentBootstrapMigrationRequest,
    StudentBootstrapMigrationResponse,
)
from backend.app.services.student_sync_service import student_sync_service

router = APIRouter(dependencies=[Depends(require_student_digital_access)])


@router.get("/sync", response_model=StudentFullSyncResponse, summary="Get Full Persistent State")
async def get_student_sync(
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    """
    Mengambil seluruh kondisi data persisten siswa untuk sinkronisasi lintas perangkat:
    progres modul, riwayat evaluasi, statistik & riwayat runner, dan aktivitas belajar.
    """
    user_email = current_user["sub"]
    return student_sync_service.get_full_student_state(user_email)


@router.post(
    "/bootstrap-migration",
    response_model=StudentBootstrapMigrationResponse,
    summary="Bootstrap Migrate Client LocalStorage Data"
)
async def bootstrap_migration(
    payload: StudentBootstrapMigrationRequest,
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    """
    Menerima data localStorage siswa yang belum tersinkronisasi dan menggabungkannya
    secara aman ke database server (union-set modul, idempotency key evaluasi, delta runner).
    """
    user_email = current_user["sub"]
    result = student_sync_service.bootstrap_migrate_local_data(
        user_email=user_email,
        local_data=payload.model_dump()
    )
    return result


# ----------------------------------------------------
# Modul Belajar Aljabar
# ----------------------------------------------------
@router.get("/progress", response_model=List[ModuleProgressItem], summary="Get Module Progress")
async def get_progress(
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    return student_sync_service.progress_repo.get_all_progress(user_email)


@router.post("/progress", response_model=ModuleProgressItem, summary="Update Module Progress")
async def update_progress(
    payload: ModuleProgressUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    result = student_sync_service.progress_repo.upsert_progress(
        user_email=user_email,
        module_id=payload.module_id,
        status=payload.status,
        slider_explored=payload.slider_explored,
        time_spent_seconds=payload.time_spent_seconds,
        completed_at=payload.completed_at,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal menyimpan progres modul."
        )
    return result


# ----------------------------------------------------
# Evaluasi 10 Soal
# ----------------------------------------------------
@router.get("/evaluations", response_model=List[EvaluationRecord], summary="Get Evaluation History")
async def get_evaluations(
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    return student_sync_service.eval_repo.get_evaluations(user_email)


@router.post("/evaluation", response_model=EvaluationRecord, summary="Submit Evaluation Result")
async def submit_evaluation(
    payload: EvaluationSubmitRequest,
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    result = student_sync_service.eval_repo.save_evaluation(
        user_email=user_email,
        idempotency_key=payload.idempotency_key,
        score=payload.score,
        accuracy=payload.accuracy,
        total_questions=payload.total_questions,
        correct_count=payload.correct_count,
        wrong_count=payload.wrong_count,
        category_breakdown=payload.category_breakdown,
        detailed_answers=payload.detailed_answers,
        completed_at=payload.completed_at,
    )

    # Catat audit trail aktivitas
    student_sync_service.activity_repo.record_activity(
        user_email=user_email,
        activity_type="EVALUATION_SUBMIT",
        module_or_feature_id="EVALUATION_10_QUESTIONS",
        metadata={
            "evaluation_id": result.get("evaluation_id"),
            "score": payload.score,
            "accuracy": payload.accuracy,
        }
    )

    return result


# ----------------------------------------------------
# NUMORA RUN Stats & Sessions
# ----------------------------------------------------
@router.get("/runner/stats", response_model=RunnerStatsResponse, summary="Get Runner Stats")
async def get_runner_stats(
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    return student_sync_service.runner_repo.get_stats(user_email)


@router.post("/runner/stats", response_model=RunnerStatsResponse, summary="Update Runner Stats Delta")
async def update_runner_stats(
    delta_games: int = Query(default=0, ge=0),
    delta_coins: int = Query(default=0, ge=0),
    delta_distance: int = Query(default=0, ge=0),
    delta_answered: int = Query(default=0, ge=0),
    delta_correct: int = Query(default=0, ge=0),
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    return student_sync_service.runner_repo.update_stats_delta(
        user_email=user_email,
        delta_games=delta_games,
        delta_coins=delta_coins,
        delta_distance=delta_distance,
        delta_answered=delta_answered,
        delta_correct=delta_correct,
    )


@router.get("/runner/sessions", response_model=List[RunnerSessionRecord], summary="Get Runner Sessions")
async def get_runner_sessions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    return student_sync_service.runner_repo.get_sessions(user_email, limit=limit, offset=offset)


@router.post("/runner/sessions", response_model=RunnerSessionSubmitResponse, summary="Record Runner Session")
async def record_runner_session(
    payload: RunnerSessionSubmitRequest,
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    result = student_sync_service.runner_repo.record_session(
        user_email=user_email,
        idempotency_key=payload.idempotency_key,
        level=payload.level,
        score=payload.score,
        coins=payload.coins,
        distance=payload.distance,
        answered=payload.answered,
        correct=payload.correct,
        accuracy=payload.accuracy,
        mistakes_count=payload.mistakes_count,
        created_at=payload.created_at,
    )

    # Catat audit trail aktivitas
    student_sync_service.activity_repo.record_activity(
        user_email=user_email,
        activity_type="RUNNER_PLAY",
        module_or_feature_id=f"RUNNER_{payload.level.upper()}",
        metadata={
            "score": payload.score,
            "coins": payload.coins,
            "distance": payload.distance,
            "is_new_high": result["is_new_high"],
        }
    )

    return result


# ----------------------------------------------------
# Aktivitas Pembelajaran
# ----------------------------------------------------
@router.post("/activities", response_model=ActivityRecord, summary="Log Learning Activity")
async def log_activity(
    payload: ActivityLogRequest,
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    user_email = current_user["sub"]
    result = student_sync_service.activity_repo.record_activity(
        user_email=user_email,
        activity_type=payload.activity_type,
        module_or_feature_id=payload.module_or_feature_id,
        metadata=payload.metadata,
    )
    return result


@router.post("/privacy/delete-my-data", summary="Request Deletion of Learning Data")
async def delete_my_data(
    current_user: Dict[str, Any] = Depends(require_student_digital_access)
):
    """
    Menghapus seluruh rekam aktivitas pembelajaran, evaluasi, progres modul, dan statistik runner
    milik pengguna terautentikasi (anti-IDOR: hanya data miliknya sendiri).
    Subjek penelitian resmi (S-001/S-002) dilindungi oleh protokol riset.
    """
    subject_id = current_user.get("subject_id")
    if subject_id in ("S-001", "S-002"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Data subjek penelitian resmi dilindungi oleh integritas protokol riset dan tidak dapat dihapus secara mandiri."
        )

    user_email = current_user["sub"]
    deleted_counts = {}
    with student_sync_service.activity_repo.get_connection() as conn:
        conn.execute("BEGIN TRANSACTION")
        c1 = conn.execute("DELETE FROM student_module_progress WHERE user_email = ?", (user_email,)).rowcount
        c2 = conn.execute("DELETE FROM student_evaluations WHERE user_email = ?", (user_email,)).rowcount
        c3 = conn.execute("DELETE FROM student_runner_sessions WHERE user_email = ?", (user_email,)).rowcount
        c4 = conn.execute("DELETE FROM student_runner_stats WHERE user_email = ?", (user_email,)).rowcount
        c5 = conn.execute("DELETE FROM learning_activities WHERE user_email = ?", (user_email,)).rowcount
        conn.commit()
        deleted_counts = {
            "modules_deleted": c1,
            "evaluations_deleted": c2,
            "runner_sessions_deleted": c3,
            "runner_stats_reset": c4,
            "activities_deleted": c5,
        }

    return {
        "success": True,
        "message": "Seluruh riwayat aktivitas pembelajaran Anda berhasil dihapus secara permanen.",
        "details": deleted_counts
    }
