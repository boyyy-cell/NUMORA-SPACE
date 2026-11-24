import asyncio
import secrets
import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.requests import Request

from backend.app.core.config import Settings, settings
from backend.app.core.security import hash_password
from backend.app.core.middleware import RequestBodyLimitMiddleware
from backend.app.core.network import get_client_ip
from backend.app.services.auth_service import AuthService
from backend.app.services.token_revocation_store import (
    RATE_LIMIT_CLEANUP_BATCH_SIZE,
    RATE_LIMIT_CLEANUP_INTERVAL_SECONDS,
    RATE_LIMIT_MAX_WINDOW_SECONDS,
    PersistentSecurityStore,
)


def _google_claims(**overrides):
    claims = {
        "iss": "https://accounts.google.com",
        "aud": "numora-test.apps.googleusercontent.com",
        "exp": int(time.time()) + 600,
        "sub": uuid4().hex,
        "email": f"google-{uuid4().hex}@example.test",
        "email_verified": True,
        "name": "Google Test User",
    }
    claims.update(overrides)
    return claims


def test_invalid_google_id_token_is_rejected(client, monkeypatch):
    from backend.app.services.auth_service import google_id_token

    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "numora-test.apps.googleusercontent.com")

    def reject_token(*_args, **_kwargs):
        raise ValueError("untrusted token detail")

    monkeypatch.setattr(google_id_token, "verify_oauth2_token", reject_token)
    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "fabricated.google.id.token"},
    )

    assert response.status_code == 401
    assert "untrusted token detail" not in response.text


@pytest.mark.parametrize(
    "claims",
    [
        {"aud": "another-app.apps.googleusercontent.com"},
        {"iss": "https://attacker.example"},
        {"exp": int(time.time()) - 1},
        {"email_verified": False},
        {"sub": ""},
    ],
)
def test_google_claims_are_checked_after_signature_verification(client, monkeypatch, claims):
    from backend.app.services.auth_service import google_id_token

    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "numora-test.apps.googleusercontent.com")
    monkeypatch.setattr(
        google_id_token,
        "verify_oauth2_token",
        lambda *_args, **_kwargs: _google_claims(**claims),
    )

    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "signed-token-verified-by-test-double"},
    )

    assert response.status_code == 401
    assert "another-app" not in response.text


def test_google_id_token_uses_google_library_and_public_signup_is_student(client, monkeypatch):
    from unittest.mock import Mock
    from backend.app.services.auth_service import google_id_token

    public_researcher_email = f"peneliti-{uuid4().hex}@example.test"
    claims = _google_claims(email=public_researcher_email)
    verifier = Mock(return_value=claims)
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "numora-test.apps.googleusercontent.com")
    monkeypatch.setattr(google_id_token, "verify_oauth2_token", verifier)

    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "verified-id-token-value"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["role"] == "student"
    verifier.assert_called_once()
    assert verifier.call_args.args[0] == "verified-id-token-value"
    assert verifier.call_args.args[2] == "numora-test.apps.googleusercontent.com"


def test_google_login_keeps_provisioned_researcher_role(client, monkeypatch):
    from backend.app.services.auth_service import auth_service, google_id_token

    email = f"owner-{uuid4().hex}@example.test"
    auth_service.provision_researcher_account(email, "valid-researcher-password", subject_id="P-001")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "numora-test.apps.googleusercontent.com")
    monkeypatch.setattr(
        google_id_token,
        "verify_oauth2_token",
        lambda *_args, **_kwargs: _google_claims(email=email),
    )

    login = client.post(
        "/api/v1/auth/google",
        json={"id_token": "verified-owner-id-token"},
    )
    assert login.status_code == 200
    assert login.json()["user"]["role"] == "researcher"
    assert login.json()["user"]["subject_id"] == "P-001"

    research_response = client.get(
        "/api/v1/research/subjects",
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
    )
    assert research_response.status_code == 200


def test_google_auth_requires_configured_client_id(client, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", None)

    response = client.post(
        "/api/v1/auth/google",
        json={"id_token": "fabricated.google.id.token"},
    )

    assert response.status_code == 503
    assert "token" not in response.text.lower()


def test_sqlite_rate_limit_is_atomic_across_store_instances(tmp_path):
    db_path = str(tmp_path / "concurrent-rate-limit.db")
    stores = [PersistentSecurityStore(db_path) for _ in range(10)]

    def attempt(store):
        try:
            store.check_and_record_login_attempt("203.0.113.9", max_attempts=5, window_seconds=60)
            return "allowed"
        except HTTPException as exc:
            assert exc.status_code == 429
            return "limited"

    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(attempt, stores))

    assert results.count("allowed") == 5
    assert results.count("limited") == 5


def test_rate_limit_scopes_are_independent(tmp_path):
    store = PersistentSecurityStore(str(tmp_path / "scoped-rate-limit.db"))

    store.check_and_record_login_attempt("198.51.100.5", max_attempts=1, scope="google_auth")
    store.check_and_record_login_attempt("198.51.100.5", max_attempts=1, scope="nora")

    with pytest.raises(HTTPException) as auth_error:
        store.check_and_record_login_attempt("198.51.100.5", max_attempts=1, scope="google_auth")
    with pytest.raises(HTTPException) as nora_error:
        store.check_and_record_login_attempt("198.51.100.5", max_attempts=1, scope="nora")

    assert auth_error.value.status_code == 429
    assert nora_error.value.status_code == 429


def test_rate_limit_cleanup_prunes_expired_rows_in_bounded_batches(tmp_path):
    store = PersistentSecurityStore(str(tmp_path / "rate-limit-cleanup.db"))
    now = int(time.time())
    store._last_rate_limit_cleanup_at = (
        time.monotonic() - RATE_LIMIT_CLEANUP_INTERVAL_SECONDS
    )
    with store._get_connection() as connection:
        connection.executemany(
            "INSERT INTO login_rate_limits (ip, attempt_time) VALUES (?, ?)",
            [
                ("abandoned:203.0.113.10", now - RATE_LIMIT_MAX_WINDOW_SECONDS - 1)
                for _ in range(RATE_LIMIT_CLEANUP_BATCH_SIZE + 1)
            ]
            + [("recent:203.0.113.11", now - RATE_LIMIT_MAX_WINDOW_SECONDS + 1)],
        )

    store.check_and_record_login_attempt("203.0.113.12", scope="nora")

    with store._get_connection() as connection:
        abandoned_count = connection.execute(
            "SELECT COUNT(*) FROM login_rate_limits WHERE ip = ?",
            ("abandoned:203.0.113.10",),
        ).fetchone()[0]
        recent_count = connection.execute(
            "SELECT COUNT(*) FROM login_rate_limits WHERE ip = ?",
            ("recent:203.0.113.11",),
        ).fetchone()[0]

    assert abandoned_count == 1
    assert recent_count == 1

    store._last_rate_limit_cleanup_at = (
        time.monotonic() - RATE_LIMIT_CLEANUP_INTERVAL_SECONDS
    )
    store.check_and_record_login_attempt("203.0.113.12", scope="nora")
    with store._get_connection() as connection:
        abandoned_count = connection.execute(
            "SELECT COUNT(*) FROM login_rate_limits WHERE ip = ?",
            ("abandoned:203.0.113.10",),
        ).fetchone()[0]
    assert abandoned_count == 0


def test_trusted_proxy_settings_reject_invalid_and_catch_all_ranges():
    for proxy in ("not-an-ip", "0.0.0.0/0", "::/0"):
        with pytest.raises(ValidationError):
            Settings(TRUSTED_PROXIES=[proxy])

    assert Settings(TRUSTED_PROXIES=["10.0.0.0/8"]).TRUSTED_PROXIES == [
        "10.0.0.0/8"
    ]


def _request_with_client_and_headers(client_host, headers=None):
    encoded_headers = [
        (name.lower().encode("latin-1"), value.encode("latin-1"))
        for name, value in (headers or {}).items()
    ]
    return Request({
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": encoded_headers,
        "client": (client_host, 12345),
        "server": ("testserver", 80),
        "scheme": "http",
        "query_string": b"",
        "http_version": "1.1",
    })


def test_client_ip_ignores_untrusted_forwarded_headers(monkeypatch):
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", [])
    direct_request = _request_with_client_and_headers(
        "198.51.100.10",
        {"X-Forwarded-For": "203.0.113.99"},
    )
    assert get_client_ip(direct_request) == "198.51.100.10"


def test_client_ip_resolves_chain_only_through_configured_proxies(monkeypatch):
    monkeypatch.setattr(settings, "TRUSTED_PROXIES", ["10.0.0.0/8"])
    trusted_request = _request_with_client_and_headers(
        "10.0.0.2",
        {"X-Forwarded-For": "198.51.100.10, 10.1.0.2"},
    )
    malformed_request = _request_with_client_and_headers(
        "10.0.0.2",
        {"X-Forwarded-For": "not-an-ip"},
    )

    assert get_client_ip(trusted_request) == "198.51.100.10"
    assert get_client_ip(malformed_request) == "10.0.0.2"


def test_request_body_middleware_limits_streamed_bodies():
    async def exercise_middleware():
        app_called = False
        sent = []
        messages = iter([
            {"type": "http.request", "body": b"12345", "more_body": True},
            {"type": "http.request", "body": b"67890", "more_body": False},
        ])

        async def receive():
            return next(messages)

        async def send(message):
            sent.append(message)

        async def downstream(_scope, _receive, _send):
            nonlocal app_called
            app_called = True

        middleware = RequestBodyLimitMiddleware(
            downstream,
            {"/api/v1/nora/chat": 8},
        )
        scope = {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/nora/chat",
            "headers": [],
        }
        await middleware(scope, receive, send)
        return app_called, sent

    app_called, sent = asyncio.run(exercise_middleware())

    assert not app_called
    assert sent[0]["status"] == 413


def test_request_body_middleware_replays_bounded_streamed_body():
    async def exercise_middleware():
        sent = []
        messages = iter([
            {"type": "http.request", "body": b"1234", "more_body": True},
            {"type": "http.request", "body": b"5678", "more_body": False},
        ])

        async def receive():
            return next(messages)

        async def send(message):
            sent.append(message)

        async def downstream(_scope, downstream_receive, downstream_send):
            body_message = await downstream_receive()
            await downstream_send({"type": "http.response.start", "status": 200, "headers": []})
            await downstream_send({"type": "http.response.body", "body": body_message["body"]})

        middleware = RequestBodyLimitMiddleware(
            downstream,
            {"/api/v1/nora/chat": 8},
        )
        scope = {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/nora/chat",
            "headers": [],
        }
        await middleware(scope, receive, send)
        return sent

    sent = asyncio.run(exercise_middleware())

    assert sent[0]["status"] == 200
    assert sent[1]["body"] == b"12345678"


def test_production_requires_explicit_strong_jwt_secret():
    with pytest.raises(ValueError, match="JWT configuration"):
        Settings(ENVIRONMENT="production", JWT_SECRET_KEY=None).validate_production_security()
    with pytest.raises(ValueError, match="JWT configuration"):
        Settings(ENVIRONMENT="production", JWT_SECRET_KEY="x" * 64).validate_production_security()

    secure_settings = Settings(ENVIRONMENT="production", JWT_SECRET_KEY=secrets.token_urlsafe(48))
    secure_settings.validate_production_security()


def test_revocation_persists_across_store_restart(tmp_path):
    db_path = str(tmp_path / "revocation.db")
    first_store = PersistentSecurityStore(db_path)
    service = AuthService(custom_security_store=first_store)

    assert service.revoke_token("test-jti-0123456789abcdef", int(time.time()) + 60)
    restarted_store = PersistentSecurityStore(db_path)

    assert restarted_store.is_token_revoked("test-jti-0123456789abcdef")


def test_account_storage_is_persistent_and_does_not_replace_existing_user(tmp_path):
    db_path = str(tmp_path / "users.db")
    first_store = PersistentSecurityStore(db_path)
    first_store.create_user(
        email="persisted@example.test",
        hashed_password=hash_password("original password"),
        name="Persistent User",
    )

    with pytest.raises(HTTPException) as exc_info:
        first_store.create_user(
            email="persisted@example.test",
            hashed_password=hash_password("replacement password"),
            name="Replacement User",
        )

    assert exc_info.value.status_code == 409
    user = PersistentSecurityStore(db_path).get_user_by_email("persisted@example.test")
    assert user["name"] == "Persistent User"
    assert user["role"] == "student"


def test_database_schema_initialization_is_additive_and_idempotent(tmp_path):
    import sqlite3

    db_path = str(tmp_path / "existing-data.db")
    with sqlite3.connect(db_path) as connection:
        connection.execute("CREATE TABLE research_marker (marker TEXT NOT NULL)")
        connection.execute("INSERT INTO research_marker VALUES ('P-001')")
        connection.execute("""
            CREATE TABLE users (
                email TEXT PRIMARY KEY,
                hashed_password TEXT NOT NULL,
                role TEXT NOT NULL,
                name TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                grade TEXT NOT NULL,
                description TEXT,
                auth_provider TEXT NOT NULL DEFAULT 'local',
                created_at INTEGER NOT NULL
            )
        """)
        connection.execute(
            "INSERT INTO users (email, hashed_password, role, name, subject_id, grade, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            ("existing@example.test", "existing-hash", "student", "Existing", "S-001", "VII", 1),
        )

    PersistentSecurityStore(db_path)
    PersistentSecurityStore(db_path)

    with sqlite3.connect(db_path) as connection:
        assert connection.execute("SELECT marker FROM research_marker").fetchone() == ("P-001",)
        assert connection.execute(
            "SELECT email, subject_id, is_provisioned_researcher FROM users"
        ).fetchone() == ("existing@example.test", "S-001", 0)
        tables = {row[0] for row in connection.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        )}

    assert {"research_marker", "users", "revoked_tokens", "login_rate_limits"} <= tables


def test_cors_is_exact_and_limits_methods_and_headers(client):
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    for origin in allowed_origins:
        allowed = client.options(
            "/api/v1/health",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "accept,content-type",
            },
        )
        assert allowed.status_code == 200
        assert allowed.headers["access-control-allow-origin"] == origin

    broad_vercel_domain = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://numora-space-preview.vercel.app",
            "Access-Control-Request-Method": "POST",
        },
    )
    disallowed_method = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "DELETE",
        },
    )

    assert "access-control-allow-origin" not in broad_vercel_domain.headers
    assert disallowed_method.status_code == 400


def test_health_liveness_and_readiness(client, monkeypatch):
    from backend.app.services.token_revocation_store import security_store

    liveness = client.get("/api/v1/live")
    assert liveness.status_code == 200
    assert liveness.json()["status"] == "alive"

    readiness = client.get("/api/v1/ready")
    assert readiness.status_code == 200
    assert readiness.json()["details"]["database"] == "available"

    monkeypatch.setattr(security_store, "is_healthy", lambda: False)
    unavailable = client.get("/api/v1/ready")
    assert unavailable.status_code == 503
    assert unavailable.json()["detail"]["details"]["database"] == "unavailable"
