import sys
from pathlib import Path

# Add project root to path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "NUMORA Space API"
    assert data["status"] == "operational"
    assert data["docs_url"] == "/docs"
    print("✓ test_root_endpoint PASSED")


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NUMORA Space" in data["service"]
    print("✓ test_health_endpoint PASSED")


def test_info_endpoint():
    response = client.get("/api/v1/info")
    assert response.status_code == 200
    data = response.json()
    assert data["app_name"] == "NUMORA Space API"
    assert data["tagline"] == "Algebra, Beyond Formulas."
    assert "0.1.0" in data["version"]
    print("✓ test_info_endpoint PASSED")


if __name__ == "__main__":
    print("Menjalankan pengujian endpoint backend FastAPI NUMORA Space...")
    test_root_endpoint()
    test_health_endpoint()
    test_info_endpoint()
    print("Seluruh pengujian endpoint backend BERHASIL 100%!")

