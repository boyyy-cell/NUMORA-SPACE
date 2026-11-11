import os
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.schemas.common import RootResponse
from backend.app.api.v1.api import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API service for NUMORA Space — AI-powered Mathematics Learning Platform for Grade 7 SMP.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware
origins = list(settings.CORS_ORIGINS) if isinstance(settings.CORS_ORIGINS, (list, tuple)) else [settings.CORS_ORIGINS]
if "https://numora-space.vercel.app" not in origins:
    origins.append("https://numora-space.vercel.app")

# Support LAN IP patterns and Vercel deployments of NUMORA Space
default_cors_regex = (
    r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$"
    r"|^https://(numora-space.*\.vercel\.app)$"
)
cors_regex = settings.CORS_ORIGIN_REGEX or default_cors_regex

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else [],
    allow_origin_regex=cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_model=RootResponse, tags=["Root"])
async def root():
    """
    Root endpoint returning general API identity and status.
    """
    return RootResponse(
        name=settings.APP_NAME,
        tagline="Algebra, Beyond Formulas.",
        version=settings.APP_VERSION,
        status="operational",
        docs_url="/docs"
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

