from fastapi import APIRouter, HTTPException, status
from backend.app.core.config import settings
from backend.app.schemas.common import HealthResponse, InfoResponse
from backend.app.services.token_revocation_store import security_store

router = APIRouter()


def _readiness_response() -> HealthResponse:
    healthy = security_store.is_healthy()
    return HealthResponse(
        status="healthy" if healthy else "unhealthy",
        service="NUMORA Space Core Backend",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        details={"database": "available" if healthy else "unavailable"}
    )


@router.get("/live", response_model=HealthResponse, summary="Backend Liveness")
async def liveness_check():
    return HealthResponse(
        status="alive",
        service="NUMORA Space Core Backend",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT
    )


@router.get("/ready", response_model=HealthResponse, summary="Backend Readiness")
async def readiness_check():
    response = _readiness_response()
    if response.status != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": response.status, "details": response.details}
        )
    return response


@router.get("/health", response_model=HealthResponse, summary="Backend Health Check")
async def health_check():
    response = _readiness_response()
    if response.status != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": response.status, "details": response.details}
        )
    return response


@router.get("/info", response_model=InfoResponse, summary="Application Information")
async def app_info():
    """
    Retrieve application identity and versioning information.
    """
    return InfoResponse(
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        tagline="Algebra, Beyond Formulas.",
        phase="Phase 01: Project Foundation & Initial Visual Studio",
        target_audience="Siswa SMP Kelas VII & Peneliti Pembelajaran",
        framework="FastAPI",
        status="active"
    )

