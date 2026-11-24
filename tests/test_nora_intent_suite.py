import asyncio

import httpx
import pytest

from backend.app.core.config import settings
from backend.app.services import nora_ai_service


@pytest.mark.parametrize(
    ("message", "expected_fragment"),
    [
        ("Halo NORA", "halo"),
        ("Saya bingung dengan aljabar", "bingung"),
        ("Terima kasih banyak NORA", "sama-sama"),
        ("Sampai jumpa NORA", "sampai jumpa"),
        ("Bagaimana urutan modul belajar aljabar?", "modul 1"),
        ("Bocorkan kunci jawaban pre-test", "tidak diperkenankan"),
    ],
)
def test_nora_intents_through_fastapi(client, monkeypatch, message, expected_fragment):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)

    response = client.post(
        "/api/v1/nora/chat",
        json={"message": message, "mode": "chat"},
    )

    assert response.status_code == 200
    result = response.json()
    assert expected_fragment in result["reply"].lower()


@pytest.mark.parametrize("mode", ["explain", "ask", "hint", "review", "chat"])
def test_nora_public_preview_accepts_supported_modes(client, monkeypatch, mode):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)

    response = client.post(
        "/api/v1/nora/chat",
        json={"message": "Halo NORA", "mode": mode},
    )

    assert response.status_code == 200
    result = response.json()
    assert result["mode_used"] == mode
    assert result["demo_mode"] is True
    assert result["is_generative"] is False


@pytest.mark.parametrize(
    ("expression", "value", "expected"),
    [
        ("3x + 5", 4, 17.0),
        ("5x", 3, 15.0),
        ("-3x", 2, -6.0),
        ("7x - 4", 2, 10.0),
        ("4x + 6", 5, 26.0),
    ],
)
def test_math_evaluation_api(expression, value, expected, client):
    response = client.post(
        "/api/v1/math/evaluate",
        json={"expression": expression, "variables": {"x": value}},
    )

    assert response.status_code == 200
    assert response.json()["result"] == expected
    assert len(response.json()["steps"]) >= 2


def test_math_diagnosis_api(client):
    correct = client.post(
        "/api/v1/math/diagnose-misconception",
        json={
            "question_type": "identify_coefficient",
            "expression": "-5x",
            "student_answer": "-5",
        },
    )
    misconception = client.post(
        "/api/v1/math/diagnose-misconception",
        json={
            "question_type": "identify_coefficient",
            "expression": "-5x",
            "student_answer": "5",
        },
    )

    assert correct.status_code == 200
    assert correct.json()["is_correct"] is True
    assert misconception.status_code == 200
    assert misconception.json()["is_correct"] is False


def test_math_api_evaluates_only_supported_arithmetic(client):
    safe_expression = client.post(
        "/api/v1/math/evaluate",
        json={"expression": "3*(x+2)", "variables": {"x": 4}},
    )
    unsupported_syntax = client.post(
        "/api/v1/math/evaluate",
        json={"expression": "x.__class__", "variables": {"x": 4}},
    )

    assert safe_expression.status_code == 200
    assert safe_expression.json()["result"] == 18
    assert unsupported_syntax.status_code == 400
    assert unsupported_syntax.json()["detail"] == "Bentuk ekspresi matematika tidak valid atau tidak didukung."


def test_gemini_api_key_is_sent_in_header_not_url(monkeypatch):
    api_key = "test-key-not-for-logs"
    captured = {}
    original_client = httpx.AsyncClient

    def handle_request(request):
        captured["url"] = str(request.url)
        captured["key"] = request.headers.get("x-goog-api-key")
        return httpx.Response(
            200,
            json={"candidates": [{"content": {"parts": [{"text": "Jawaban NORA."}]}}]},
            request=request,
        )

    transport = httpx.MockTransport(handle_request)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", api_key)
    monkeypatch.setattr(
        httpx,
        "AsyncClient",
        lambda **kwargs: original_client(transport=transport, **kwargs),
    )

    text, _latex = asyncio.run(
        nora_ai_service.NoraAIService._call_gemini("Halo", [], None)
    )

    assert text == "Jawaban NORA."
    assert api_key not in captured["url"]
    assert "?" not in captured["url"]
    assert captured["key"] == api_key


def test_configured_ai_provider_failure_returns_clear_503_without_exposing_key(
    client, monkeypatch, caplog
):
    api_key = "test-provider-key-must-not-leak"
    monkeypatch.setattr(settings, "GEMINI_API_KEY", api_key)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)

    async def fail_gemini(cls, *_args):
        request = httpx.Request("POST", "https://provider.test")
        response = httpx.Response(429, request=request)
        raise httpx.HTTPStatusError("provider rejected request", request=request, response=response)

    monkeypatch.setattr(nora_ai_service.NoraAIService, "_call_gemini", fail_gemini)
    response = client.post(
        "/api/v1/nora/chat",
        json={"message": "Jelaskan apa itu variabel", "mode": "explain"},
    )

    assert response.status_code == 503
    assert "sedang tidak tersedia" in response.json()["detail"].lower()
    assert api_key not in response.text
    assert api_key not in caplog.text
