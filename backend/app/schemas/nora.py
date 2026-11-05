from pydantic import BaseModel, Field
from typing import Optional, List


class NoraChatRequest(BaseModel):
    message: str = Field(..., example="NORA, apa koefisien dari -5x?")
    mode: str = Field(default="explain", example="explain")  # explain, ask, hint, review
    hint_tier: Optional[int] = Field(default=1, example=1)   # 1 (gentle), 2 (concept), 3 (specific)
    context_topic: Optional[str] = Field(default="algebra_coefficients", example="algebra_coefficients")


class NoraChatResponse(BaseModel):
    reply: str
    mode_used: str
    math_latex: Optional[str] = None
    voice_spoken_text: str
    hint_tier: Optional[int] = None
    misconception_flag: Optional[str] = None
    socratic_question: Optional[str] = None
    demo_mode: bool = True

