from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional


class EvaluateExpressionRequest(BaseModel):
    expression: str = Field(..., example="3x + 5")
    variables: Dict[str, float] = Field(default_factory=lambda: {"x": 4}, example={"x": 4})


class CalculationStep(BaseModel):
    step_number: int
    description: str
    expression_state: str


class EvaluateExpressionResponse(BaseModel):
    expression: str
    variables: Dict[str, float]
    result: float
    steps: List[CalculationStep]
    formatted_latex: str
    interpretation: str


class DiagnoseMisconceptionRequest(BaseModel):
    question_type: str = Field(..., example="identify_coefficient")
    expression: str = Field(..., example="-5x")
    student_answer: str = Field(..., example="5")


class DiagnoseMisconceptionResponse(BaseModel):
    is_correct: bool
    student_answer: str
    diagnosed_type: str
    feedback: str
    pedagogical_mode: str
    recommended_hint: Optional[str] = None
