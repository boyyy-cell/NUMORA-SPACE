import ipaddress
import logging
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.middleware import RequestBodyLimitMiddleware
from backend.app.schemas.common import RootResponse
from backend.app.api.v1.api import api_router
from backend.app.services.token_revocation_store import security_store

settings.validate_production_security()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API service for NUMORA Space — AI-powered Mathematics Learning Platform for Grade 7 SMP.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)


# CORS is added after the request limiter so 413 responses retain CORS headers.
app.add_middleware(
    RequestBodyLimitMiddleware,
    route_limits={
        "/api/v1/auth/google": 12 * 1024,
        "/api/v1/nora/chat": 32 * 1024,
    },
)

def _is_local_origin(origin: str) -> bool:
    hostname = (urlsplit(origin).hostname or "").lower()
    if hostname == "localhost" or hostname.endswith(".localhost"):
        return True
    try:
        address = ipaddress.ip_address(hostname)
        return address.is_private or address.is_loopback or address.is_link_local
    except ValueError:
        return False


origins = [origin.rstrip("/") for origin in settings.CORS_ORIGINS]
if "*" in origins:
    raise ValueError("Wildcard CORS origins are not supported.")
if (settings.ENVIRONMENT or "").strip().lower() == "production":
    origins = [origin for origin in origins if not _is_local_origin(origin)]
if not origins:
    raise ValueError("At least one explicit CORS origin must be configured.")

is_dev = (settings.ENVIRONMENT or "").strip().lower() != "production"
cors_origin_regex = (
    r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$"
    if is_dev else r"^https://numora-space(-[a-z0-9-]+)?\.vercel\.app$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"],
)

# Include v1 router
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_model=RootResponse, tags=["Root"])
@app.get("/index.py", response_model=RootResponse, tags=["Root"], include_in_schema=False)
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
    logging.getLogger(__name__).error(
        "Unhandled application error path=%s type=%s",
        request.url.path,
        type(exc).__name__
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "Terjadi kesalahan internal pada server. Silakan hubungi administrator.",
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

