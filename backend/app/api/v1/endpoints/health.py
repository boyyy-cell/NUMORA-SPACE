from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.common import HealthResponse, InfoResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Backend Health Check")
async def health_check():
    """
    Check the health status of the NUMORA Space Backend API.
    Used by frontend services to verify connectivity.
    """
    return HealthResponse(
        status="healthy",
        service="NUMORA Space Core Backend",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        details={
            "database": "Phase 02 (Supabase integration pending)",
            "nora_ai": "Phase 01 Demo Mode",
            "cors_configured": True
        }
    )


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

