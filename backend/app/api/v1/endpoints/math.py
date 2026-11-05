from fastapi import APIRouter, HTTPException
from backend.app.schemas.math import (
    EvaluateExpressionRequest,
    EvaluateExpressionResponse,
    DiagnoseMisconceptionRequest,
    DiagnoseMisconceptionResponse,
)
from backend.app.services.math_engine import MathEngine

router = APIRouter()


@router.post("/evaluate", response_model=EvaluateExpressionResponse, summary="Evaluate Algebraic Expression")
async def evaluate_expression(payload: EvaluateExpressionRequest):
    """
    Evaluates linear algebraic expressions with step-by-step substitution and calculations.
    Specifically tests and verifies cases like:
    - 3x + 5 (x=4) -> 17
    - 5x (x=3) -> 15
    - -3x (x=2) -> -6
    - 7x - 4 (x=2) -> 10
    - 4x + 6 (x=5) -> 26
    """
    try:
        return MathEngine.evaluate_linear_expression(payload.expression, payload.variables)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/diagnose-misconception", response_model=DiagnoseMisconceptionResponse, summary="Diagnose Socratic Misconception")
async def diagnose_misconception(payload: DiagnoseMisconceptionRequest):
    """
    Analyzes student answer to identify underlying conceptual errors (e.g. sign omission in -5x).
    """
    return MathEngine.diagnose_misconception(
        question_type=payload.question_type,
        expression=payload.expression,
        student_answer=payload.student_answer
    )

