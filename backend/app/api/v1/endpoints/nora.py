from fastapi import APIRouter, Request
from backend.app.core.network import get_client_ip
from backend.app.schemas.nora import NoraChatRequest, NoraChatResponse
from backend.app.services.nora_ai_service import NoraAIService
from backend.app.services.token_revocation_store import security_store

router = APIRouter()

NORA_REQUESTS_PER_MINUTE = 20


@router.post("/chat", response_model=NoraChatResponse, summary="NORA Open Conversational AI & Socratic Interaction")
async def nora_chat(request: Request, payload: NoraChatRequest):
    """
    Open Conversational AI endpoint for NORA:
    - Hybrid AI: Generative AI (Gemini / OpenAI) with Verified Math Engine integration.
    - Socratic pedagogical scaffolding (Explain, Ask, Hint, Review).
    - Assessment guardrail protection (refusal to spoil research pre-test / post-test).
    - Dynamic multi-turn conversational context.
    """
    security_store.check_and_record_login_attempt(
        get_client_ip(request),
        max_attempts=NORA_REQUESTS_PER_MINUTE,
        window_seconds=60,
        scope="nora",
    )
    return await NoraAIService.process_chat(payload)
