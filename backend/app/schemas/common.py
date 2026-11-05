from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime


class RootResponse(BaseModel):
    name: str = Field(..., example="NUMORA Space API")
    tagline: str = Field(..., example="Algebra, Beyond Formulas.")
    version: str = Field(..., example="0.1.0")
    status: str = Field(..., example="operational")
    docs_url: str = Field(..., example="/docs")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", example="healthy")
    service: str = Field(..., example="NUMORA Space Core Backend")
    version: str = Field(..., example="0.1.0")
    environment: str = Field(..., example="development")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = None


class InfoResponse(BaseModel):
    app_name: str = Field(..., example="NUMORA Space API")
    version: str = Field(..., example="0.1.0")
    tagline: str = Field(..., example="Algebra, Beyond Formulas.")
    phase: str = Field(default="Phase 01: Project Foundation & Initial Visual Studio")
    target_audience: str = Field(default="Siswa SMP Kelas VII & Peneliti Pembelajaran")
    framework: str = Field(default="FastAPI")
    status: str = Field(default="active")

