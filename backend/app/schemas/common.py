from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime, timezone


class RootResponse(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "NUMORA Space API"})
    tagline: str = Field(..., json_schema_extra={"example": "Algebra, Beyond Formulas."})
    version: str = Field(..., json_schema_extra={"example": "0.1.0"})
    status: str = Field(..., json_schema_extra={"example": "operational"})
    docs_url: str = Field(..., json_schema_extra={"example": "/docs"})
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", json_schema_extra={"example": "healthy"})
    service: str = Field(..., json_schema_extra={"example": "NUMORA Space Core Backend"})
    version: str = Field(..., json_schema_extra={"example": "0.1.0"})
    environment: str = Field(..., json_schema_extra={"example": "development"})
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    details: Optional[Dict[str, Any]] = None


class InfoResponse(BaseModel):
    app_name: str = Field(..., json_schema_extra={"example": "NUMORA Space API"})
    version: str = Field(..., json_schema_extra={"example": "0.1.0"})
    tagline: str = Field(..., json_schema_extra={"example": "Algebra, Beyond Formulas."})
    phase: str = Field(default="Phase 01: Project Foundation & Initial Visual Studio")
    target_audience: str = Field(default="Siswa SMP Kelas VII & Peneliti Pembelajaran")
    framework: str = Field(default="FastAPI")
    status: str = Field(default="active")

