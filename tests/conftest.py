import os
import secrets
import tempfile

import pytest


_test_database_dir = tempfile.TemporaryDirectory(prefix="numora-pytest-")
os.environ["NUMORA_SECURITY_DB_PATH"] = os.path.join(_test_database_dir.name, "security-test.db")
os.environ["ENVIRONMENT"] = "test"
os.environ["JWT_SECRET_KEY"] = secrets.token_urlsafe(48)
os.environ["CORS_ORIGINS"] = (
    '["http://localhost:5173","http://127.0.0.1:5173",'
    '"http://localhost:5174","http://127.0.0.1:5174",'
    '"https://numora-space.vercel.app"]'
)


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    from backend.app.main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def clear_test_rate_limits():
    from backend.app.services.token_revocation_store import security_store

    with security_store._get_connection() as connection:
        connection.execute("DELETE FROM login_rate_limits")
    yield


def pytest_sessionfinish(session, exitstatus):
    _test_database_dir.cleanup()
