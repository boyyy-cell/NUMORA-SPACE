from fastapi import APIRouter
from backend.app.api.v1.endpoints import health, math, research, nora, auth, student

api_router = APIRouter()
api_router.include_router(health.router, tags=["System Health & Info"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access Control (Phase 02)"])
api_router.include_router(student.router, prefix="/student", tags=["Student Persistent Data & Multi-Device Sync"])
api_router.include_router(math.router, prefix="/math", tags=["Mathematical Engine"])
api_router.include_router(research.router, prefix="/research", tags=["Educational Research (RBAC Protected)"])
api_router.include_router(nora.router, prefix="/nora", tags=["NORA Socratic AI"])
