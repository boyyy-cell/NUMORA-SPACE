from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class NoraMessage(BaseModel):
    role: Literal["user", "assistant", "nora"]
    content: str = Field(..., min_length=1, max_length=1000)


class NoraChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        json_schema_extra={"example": "NORA, apa koefisien dari -5x?"},
    )
    mode: Literal["explain", "ask", "hint", "review", "chat"] = "explain"
    hint_tier: int = Field(default=1, ge=1, le=3)
    context_topic: Optional[str] = Field(default="algebra_coefficients", max_length=100)
    history: List[NoraMessage] = Field(default_factory=list, max_length=6)


class NoraChatResponse(BaseModel):
    reply: str
    mode_used: str
    math_latex: Optional[str] = None
    voice_spoken_text: str
    hint_tier: Optional[int] = None
    misconception_flag: Optional[str] = None
    socratic_question: Optional[str] = None
    demo_mode: bool = True
    verified_math: Optional[Dict[str, Any]] = None
    is_generative: bool = False
