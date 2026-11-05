from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.app.schemas.research import (
    ResearchSubject,
    ResearchSessionLog,
    CognitiveLoadInstrumentStatus,
)
from backend.app.services.research_store import research_store

router = APIRouter()


@router.get("/subjects", response_model=List[ResearchSubject], summary="List Small-Scale Research Subjects")
async def get_subjects():
    """
    Returns the two Grade 7 subjects (S-001 Control and S-002 Experimental).
    Follows authentic educational research protocol without fabricated sample populations.
    """
    return research_store.get_all_subjects()


@router.get("/sessions", response_model=List[ResearchSessionLog], summary="Get Research Session Logs")
async def get_sessions(subject_id: Optional[str] = None):
    """
    Returns verified research session logs for S-001 or S-002.
    """
    return research_store.get_sessions(subject_id=subject_id)


@router.get("/cognitive-load-status", response_model=CognitiveLoadInstrumentStatus, summary="Leppink Cognitive Load Status")
async def get_cognitive_load_status():
    """
    Returns status of the Leppink multidimensional cognitive load instrument.
    Marked NOT CONFIGURED until empirical measurements take place.
    """
    return research_store.get_cognitive_load_instrument_status()
