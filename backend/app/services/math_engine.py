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
        Diagnoses conceptual errors in Grade 7 algebra across the 4 foundational modules:
        1. identify_variable (Variabel)
        2. identify_coefficient (Koefisien)
        3. identify_constant (Konstanta)
        4. evaluate_substitution (Bentuk Aljabar & Evaluasi Substitusi)
        """
        ans_clean = student_answer.strip().lower()
        expr_clean = expression.replace(" ", "").lower()

        # 1. IDENTIFIKASI VARIABEL
        if question_type == "identify_variable":
            # Menentukan variabel dari bentuk aljabar (contoh: 7a + 12 -> a)
            if ans_clean in ("a", "variabel a", "huruf a", "x", "variabel x") and (ans_clean in expr_clean or ans_clean.replace("variabel ", "").replace("huruf ", "") in expr_clean):
                return DiagnoseMisconceptionResponse(
                    is_correct=True,
                    student_answer=student_answer,
                    diagnosed_type="Concept Mastered (Correct)",
                    feedback="Tepat sekali! Variabel adalah lambang atau huruf yang mewakili bilangan atau nilai yang belum diketahui nilainya.",
                    pedagogical_mode="Review",
                    recommended_hint=None
                )
            elif any(c in ans_clean for c in ["7", "3", "4", "5"]) and not any(ch.isalpha() for ch in ans_clean):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Variable/Coefficient Confusion (Tertukar Variabel & Koefisien)",
                    feedback=f"Jawaban '{student_answer}' adalah koefisien (angka pengali), bukan variabel. Variabel adalah lambang huruf penampung nilai.",
                    pedagogical_mode="Explain",
                    recommended_hint="Cari lambang huruf pada bentuk aljabar tersebut."
                )
            elif any(c in ans_clean for c in ["12", "6", "8"]) and not any(ch.isalpha() for ch in ans_clean):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Variable/Constant Confusion (Tertukar Variabel & Konstanta)",
                    feedback=f"Jawaban '{student_answer}' adalah konstanta (bilangan mandiri), bukan variabel.",
                    pedagogical_mode="Explain",
                    recommended_hint="Variabel dilambangkan dengan huruf (seperti a, x, atau y)."
                )
            elif "7a" in ans_clean or "3x" in ans_clean or "4x" in ans_clean:
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Term Confusion (Tertukar Suku & Variabel)",
                    feedback=f"'{student_answer}' adalah satu suku aljabar lengkap. Variabel hanyalah lambang hurufnya saja tanpa menyertakan angka koefisien di depannya.",
                    pedagogical_mode="Hint",
                    recommended_hint="Tuliskan lambang hurufnya saja (misal: a)."
                )
            else:
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Unrecognized Response",
                    feedback=f"Jawaban '{student_answer}' belum tepat. Variabel adalah lambang huruf yang mewakili nilai tertentu pada bentuk {expression}.",
                    pedagogical_mode="Hint",
                    recommended_hint="Perhatikan lambang huruf dalam bentuk aljabar tersebut."
                )

        # 2. IDENTIFIKASI KOEFISIEN
        elif question_type == "identify_coefficient" or "-5x" in expression:
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
                    feedback=f"Bentuk {expression} memiliki koefisien. Jika koefisien bernilai 0, maka 0 dikali variabel akan bernilai 0 dan variabel tidak akan muncul.",
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

        # 3. IDENTIFIKASI KONSTANTA
        elif question_type == "identify_constant" or "-8" in expression:
            if ans_clean in ("-8", "-8.0"):
                return DiagnoseMisconceptionResponse(
                    is_correct=True,
                    student_answer=student_answer,
                    diagnosed_type="Concept Mastered (Correct)",
                    feedback="Hebat! Konstanta dari 3x - 8 adalah -8. Tanda negatif di depan angka merupakan bagian utuh dari nilai konstanta tersebut.",
                    pedagogical_mode="Review",
                    recommended_hint=None
                )
            elif ans_clean in ("8", "+8"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Sign Omission Error (Tanda Negatif Terabaikan)",
                    feedback="Perhatikan operasi pengurangan di depan angka 8. Pengurangan 8 setara dengan menjumlahkan bilangan negatif (-8). Jadi konstantanya adalah -8, bukan 8.",
                    pedagogical_mode="Hint",
                    recommended_hint="Tanda minus di depan konstanta ikut menjadi tanda negatif dari angka tersebut."
                )
            elif ans_clean in ("3", "+3"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Constant/Coefficient Confusion (Tertukar Konstanta & Koefisien)",
                    feedback="Angka 3 adalah koefisien yang menempel pada variabel x. Konstanta adalah bilangan mandiri yang berdiri sendiri tanpa variabel.",
                    pedagogical_mode="Explain",
                    recommended_hint="Cari suku bilangan yang berdiri sendiri tanpa huruf variabel."
                )
            elif "3x" in ans_clean:
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Term Confusion (Tertukar Suku & Konstanta)",
                    feedback="3x adalah suku bervariabel, bukan konstanta. Konstanta tidak memiliki huruf variabel pengali.",
                    pedagogical_mode="Explain",
                    recommended_hint="Konstanta adalah bilangan yang nilainya tetap dan tidak memuat huruf."
                )
            else:
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Unrecognized Response",
                    feedback=f"Jawaban '{student_answer}' belum tepat. Konstanta adalah suku bilangan mandiri yang nilainya tetap.",
                    pedagogical_mode="Hint",
                    recommended_hint="Lihat bilangan yang berdiri sendiri pada bentuk aljabar."
                )

        # 4. EVALUASI BENTUK ALJABAR / SUBSTITUSI
        elif question_type == "evaluate_substitution" or "4x+6" in expr_clean or "4x + 6" in expression:
            if ans_clean in ("26", "26.0", "rp26.000", "26 ribu", "26000"):
                return DiagnoseMisconceptionResponse(
                    is_correct=True,
                    student_answer=student_answer,
                    diagnosed_type="Concept Mastered (Correct)",
                    feedback="Luar biasa! Substitusi x = 5 ke bentuk 4x + 6 menghasilkan 4(5) + 6 = 20 + 6 = 26.",
                    pedagogical_mode="Review",
                    recommended_hint=None
                )
            elif ans_clean in ("45", "456"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Concatenation Error (Penggabungan Angka Bukan Perkalian)",
                    feedback="Miskonsepsi penggabungan: suku 4x berarti 4 dikalikan x, bukan menempelkan angka menjadi 45. Jadi hitunglah 4 × 5 = 20, lalu jumlahkan dengan 6.",
                    pedagogical_mode="Explain",
                    recommended_hint="Suku 4x berarti operasi perkalian: 4 dikali nilai x."
                )
            elif ans_clean in ("20", "20.0"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Incomplete Operation (Operasi Belum Tuntas)",
                    feedback="Kamu sudah benar menghitung 4 × 5 = 20! Namun jangan lupa menjumlahkan suku konstantanya (+ 6). Totalnya menjadi 20 + 6.",
                    pedagogical_mode="Hint",
                    recommended_hint="Selesaikan hingga suku konstanta: 20 + 6 = ?"
                )
            elif ans_clean in ("15", "44", "50"):
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Order of Operations Error (Urutan Operasi Hitung)",
                    feedback="Ingat hierarki operasi: kerjakan perkalian 4 × 5 terlebih dahulu sebelum melakukan penjumlahan dengan konstanta 6.",
                    pedagogical_mode="Explain",
                    recommended_hint="Dahulukan perkalian sebelum penjumlahan."
                )
            else:
                return DiagnoseMisconceptionResponse(
                    is_correct=False,
                    student_answer=student_answer,
                    diagnosed_type="Calculation Error",
                    feedback=f"Hasil '{student_answer}' belum tepat. Substitusikan x = 5: 4(5) + 6 = 20 + 6 = 26.",
                    pedagogical_mode="Hint",
                    recommended_hint="Kalikan 4 dengan 5, kemudian tambahkan 6."
                )

        return DiagnoseMisconceptionResponse(
            is_correct=False,
            student_answer=student_answer,
            diagnosed_type="General Evaluation",
            feedback="Jawaban sedang dievaluasi.",
            pedagogical_mode="Hint"
        )

