"""Tests for backend service health check endpoints."""

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_backend_health_check_status_code() -> None:
    """Verify that GET /api/v1/health returns HTTP 200."""
    response = client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200


def test_backend_health_check_payload() -> None:
    """Verify that GET /api/v1/health returns expected JSON keys and metadata."""
    response = client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.headers["content-type"].startswith("application/json")

    data = response.json()
    assert isinstance(data, dict)
    assert data.get("status") == "healthy"
    assert data.get("service") == settings.PROJECT_NAME
    assert data.get("version") == settings.VERSION
    assert "environment" in data


def test_database_health_endpoint_removed() -> None:
    """Verify that /api/v1/health/database has been completely removed (returns HTTP 404)."""
    response = client.get(f"{settings.API_V1_PREFIX}/health/database")
    assert response.status_code == 404
