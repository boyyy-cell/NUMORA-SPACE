from fastapi import APIRouter
from backend.app.schemas.nora import NoraChatRequest, NoraChatResponse
from backend.app.services.nora_ai_service import NoraAIService

router = APIRouter()


@router.post("/chat", response_model=NoraChatResponse, summary="NORA Open Conversational AI & Socratic Interaction")
async def nora_chat(payload: NoraChatRequest):
    """
    Open Conversational AI endpoint for NORA:
    - Hybrid AI: Generative AI (Gemini / OpenAI) with Verified Math Engine integration.
    - Socratic pedagogical scaffolding (Explain, Ask, Hint, Review).
    - Assessment guardrail protection (refusal to spoil research pre-test / post-test).
    - Dynamic multi-turn conversational context.
    """
    return await NoraAIService.process_chat(payload)
