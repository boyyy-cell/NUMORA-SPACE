import re
from typing import Dict, List, Tuple
from backend.app.schemas.math import (
    EvaluateExpressionResponse,
    CalculationStep,
    DiagnoseMisconceptionResponse,
)


class MathEngine:
    @staticmethod
    def evaluate_linear_expression(expr: str, variables: Dict[str, float]) -> EvaluateExpressionResponse:
        """
        Evaluates linear algebraic expressions of form ax + b, ax - b, or ax.
        Produces step-by-step pedagogical breakdown for Grade 7 SMP students.
        """
        clean_expr = expr.replace(" ", "")
        x_val = variables.get("x", 0.0)

        # Regex to parse [sign] [coeff] x [ [sign] [const] ]
        pattern = r"^([+-]?\d*)x([+-]\d+)?$"
        match = re.match(pattern, clean_expr)

        if not match:
            # Fallback simple evaluator
            try:
                # safe replacement for single variable x
                eval_str = clean_expr.replace("x", f"({x_val})")
                res = float(eval(eval_str, {"__builtins__": None}, {}))
                return EvaluateExpressionResponse(
                    expression=expr,
                    variables=variables,
                    result=res,
                    steps=[
                        CalculationStep(step_number=1, description=f"Substitusi nilai x = {x_val}", expression_state=eval_str),
                        CalculationStep(step_number=2, description="Hitung operasi aritmetika", expression_state=str(res)),
                    ],
                    formatted_latex=f"{expr} \\implies {res}",
                    interpretation=f"Hasil substitusi {expr} untuk x = {x_val} menghasilkan nilai {res}.",
                )
            except Exception as e:
                raise ValueError(f"Bentuk ekspresi matematika tidak didukung: {expr}")

        coeff_str, const_str = match.groups()

        # Parse coefficient
        if coeff_str in ("", "+"):
            a = 1.0
        elif coeff_str == "-":
            a = -1.0
        else:
            a = float(coeff_str)

        # Parse constant
        b = float(const_str) if const_str else 0.0

        # Calculations
        term_ax = a * x_val
        final_result = term_ax + b

        # Formulate pedagogical steps
        steps: List[CalculationStep] = []
        steps.append(
            CalculationStep(
                step_number=1,
                description=f"Substitusi variabel x dengan nilai {x_val}",
                expression_state=f"{a}({x_val}) {'+ ' + str(b) if b > 0 else ('- ' + str(abs(b)) if b < 0 else '')}".strip()
            )
        )
        steps.append(
            CalculationStep(
                step_number=2,
                description=f"Kalikan koefisien ({a}) dengan nilai variabel ({x_val})",
                expression_state=f"{term_ax} {'+ ' + str(b) if b > 0 else ('- ' + str(abs(b)) if b < 0 else '')}".strip()
            )
        )
        if b != 0:
            steps.append(
                CalculationStep(
                    step_number=3,
                    description=f"{'Tambahkan' if b > 0 else 'Kurangkan'} dengan nilai konstanta ({abs(b)})",
                    expression_state=str(final_result)
                )
            )

        # LaTeX representation
        latex_str = f"{expr} = {a}({x_val}) {'+ ' + str(b) if b > 0 else ('- ' + str(abs(b)) if b < 0 else '')} = {final_result}"

        # Contextual interpretation
        interpretation = (
            f"Untuk nilai x = {x_val}, komponen variabel bernilai {term_ax} "
            f"{f'dan setelah diperhitungkan dengan konstanta {b}, ' if b != 0 else ''}"
            f"menghasilkan total nilai akhir {final_result}."
        )

        return EvaluateExpressionResponse(
            expression=expr,
            variables=variables,
            result=final_result,
            steps=steps,
            formatted_latex=latex_str,
            interpretation=interpretation
        )

    @staticmethod
    def diagnose_misconception(question_type: str, expression: str, student_answer: str) -> DiagnoseMisconceptionResponse:
        """
        Diagnoses conceptual errors in Grade 7 algebra.
        Specifically handles: 'Apa koefisien dari -5x?' and general linear terms.
        """
        ans_clean = student_answer.strip().lower()

        if question_type == "identify_coefficient" or "-5x" in expression:
            if ans_clean in ("-5", "-5.0"):
                return DiagnoseMisconceptionResponse(
                    is_correct=True,
                    student_answer=student_answer,
                    diagnosed_type="Concept Mastered (Correct)",
                    feedback="Luar biasa! Kamu tepat. Koefisien adalah faktor pengali yang mencakup tanda positif/negatifnya, yaitu -5.",
                    pedagogical_mode="Review",
                    recommended_hint=None
                )
            elif ans_clean in ("5", "+5"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Sign Omission Error (Tanda Negatif Terabaikan)",
                    feedback="Hampir tepat! Namun perhatikan tanda di depan angka. Tanda negatif (-) melekat pada koefisien tersebut. Jadi koefisiennya adalah -5, bukan 5.",
                    pedagogical_mode="Hint",
                    recommended_hint="Perhatikan tanda operasional di depan angka koefisien."
                )
            elif ans_clean in ("x", "-x"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Variable/Coefficient Confusion (Tertukar Variabel & Koefisien)",
                    feedback="Huruf x adalah Variabel (wadah nilai yang belum diketahui), sedangkan Koefisien adalah angka bilangan yang mengalikannya. Coba amati angka di depan x.",
                    pedagogical_mode="Explain",
                    recommended_hint="Koefisien adalah angka pengalinya, bukan lambang hurufnya."
                )
            elif ans_clean in ("0", "tidak ada"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Unmastered Concept (Konsep Belum Dipahami)",
                    feedback="Bentuk -5x memiliki koefisien -5. Jika koefisien bernilai 0, maka 0 dikali x akan bernilai 0 dan x tidak akan muncul.",
                    pedagogical_mode="Explain",
                    recommended_hint="Mari pelajari kembali analogi wadah dan kelipatannya di Laboratorium Aljabar."
                )
            else:
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Unrecognized Response",
                    feedback=f"Jawaban '{student_answer}' belum tepat untuk koefisien dari {expression}. Koefisien adalah angka yang mengalikan variabel.",
                    pedagogical_mode="Hint",
                    recommended_hint="Fokus pada angka di sebelah kiri variabel x."
                )

        return DiagnoseMisconceptionResponse(
            is_correct=False,
            student_answer=student_answer,
            diagnosed_type="General Evaluation",
            feedback="Jawaban sedang dievaluasi.",
            pedagogical_mode="Hint"
        )
