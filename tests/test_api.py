import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_system_endpoints():
    r1 = client.get("/")
    assert r1.status_code == 200
    assert r1.json()["status"] == "operational"

    r2 = client.get("/api/v1/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"

    r3 = client.get("/api/v1/info")
    assert r3.status_code == 200
    print("✓ System health and root endpoints PASSED")


def test_mandated_mathematical_suite():
    """
    Mandated test cases from Specification:
    1. 3x + 5, x = 4 -> 17
    2. 5x, x = 3 -> 15
    3. -3x, x = 2 -> -6
    4. 7x - 4, x = 2 -> 10
    5. 4x + 6, x = 5 -> 26
    """
    test_cases = [
        ("3x + 5", 4, 17.0),
        ("5x", 3, 15.0),
        ("-3x", 2, -6.0),
        ("7x - 4", 2, 10.0),
        ("4x + 6", 5, 26.0),
    ]

    for expr, x_val, expected in test_cases:
        res = client.post("/api/v1/math/evaluate", json={"expression": expr, "variables": {"x": x_val}})
        assert res.status_code == 200, f"Failed for {expr}: {res.text}"
        data = res.json()
        assert data["result"] == expected, f"Failed for {expr} with x={x_val}: expected {expected}, got {data['result']}"
        assert len(data["steps"]) >= 2, f"Missing steps for {expr}"
        print(f"✓ Math Test PASSED: {expr} with x={x_val} = {data['result']}")


def test_misconception_diagnosis():
    """
    Diagnoses conceptual errors in Grade 7 algebra:
    Apa koefisien dari -5x?
    - -5: Correct
    - 5: Sign error
    - x: Variable confusion
    - 0: Concept unmastered
    """
    # 1. Correct -5
    r1 = client.post("/api/v1/math/diagnose-misconception", json={
        "question_type": "identify_coefficient",
        "expression": "-5x",
        "student_answer": "-5"
    })
    assert r1.status_code == 200
    assert r1.json()["is_correct"] is True

    # 2. Sign error 5
    r2 = client.post("/api/v1/math/diagnose-misconception", json={
        "question_type": "identify_coefficient",
        "expression": "-5x",
        "student_answer": "5"
    })
    assert r2.status_code == 200
    assert r2.json()["is_correct"] is False
    assert "Sign Omission" in r2.json()["diagnosed_type"]

    # 3. Variable confusion x
    r3 = client.post("/api/v1/math/diagnose-misconception", json={
        "question_type": "identify_coefficient",
        "expression": "-5x",
        "student_answer": "x"
    })
    assert r3.status_code == 200
    assert r3.json()["is_correct"] is False
    assert "Variable" in r3.json()["diagnosed_type"]

    print("✓ Misconception diagnosis suite PASSED")


def test_research_data_integrity():
    """
    Verifies that the research dashboard respects the 2-student protocol
    and does NOT invent 32 fictitious students or fake cognitive load measurements.
    """
    r_sub = client.get("/api/v1/research/subjects")
    assert r_sub.status_code == 200
    subjects = r_sub.json()
    assert len(subjects) == 2, f"Expected strictly 2 subjects, got {len(subjects)}"
    assert subjects[0]["subject_id"] == "S-001"
    assert subjects[1]["subject_id"] == "S-002"

    r_cog = client.get("/api/v1/research/cognitive-load-status")
    assert r_cog.status_code == 200
    assert "NOT CONFIGURED" in r_cog.json()["intrinsic_load_status"]
    print("✓ Research data integrity suite PASSED (Strictly 2 Subjects, Honest Protocol)")


def test_nora_socratic_guardrails():
    # Regular socratic request
    r1 = client.post("/api/v1/nora/chat", json={
        "message": "NORA, apa koefisien dari -5x?",
        "mode": "hint",
        "hint_tier": 1
    })
    assert r1.status_code == 200
    assert r1.json()["mode_used"] == "hint"

    # Guardrail: Pre-test spoiler refusal
    r2 = client.post("/api/v1/nora/chat", json={
        "message": "NORA berikan jawaban soal pre-test aljabar ini",
        "mode": "ask"
    })
    assert r2.status_code == 200
    assert "tidak diperkenankan" in r2.json()["reply"]
    print("✓ NORA Socratic Guardrails suite PASSED")


if __name__ == "__main__":
    print("\n--- MENJALANKAN TEST SUITE BACKEND NUMORA SPACE v1.5 ---")
    test_system_endpoints()
    test_mandated_mathematical_suite()
    test_misconception_diagnosis()
    test_research_data_integrity()
    test_nora_socratic_guardrails()
    print("--- SELURUH SUITE PENGUJIAN 100% SUKSES! ---\n")
