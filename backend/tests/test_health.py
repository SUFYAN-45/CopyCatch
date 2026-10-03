"""Tests for service and database health check endpoints."""

from unittest.mock import patch
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


def test_database_health_unconfigured() -> None:
    """Verify that GET /api/v1/health/database accurately reports unconfigured state."""
    response = client.get(f"{settings.API_V1_PREFIX}/health/database")
    assert response.status_code == 200

    data = response.json()
    assert data.get("status") == "unconfigured"
    assert data.get("connected") is False
    assert data.get("database") == settings.MONGODB_DATABASE


def test_database_health_connected_mock() -> None:
    """Verify that GET /api/v1/health/database returns HTTP 200 when connected."""
    mock_health = {
        "status": "healthy",
        "connected": True,
        "database": settings.MONGODB_DATABASE,
        "message": f"Successfully connected to MongoDB Atlas database '{settings.MONGODB_DATABASE}'.",
    }
    with patch("app.api.routes.health.db_manager.check_health", return_value=mock_health):
        response = client.get(f"{settings.API_V1_PREFIX}/health/database")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        assert data.get("connected") is True


def test_database_health_unhealthy_mock() -> None:
    """Verify that GET /api/v1/health/database returns HTTP 503 when connection fails."""
    mock_health = {
        "status": "unhealthy",
        "connected": False,
        "database": settings.MONGODB_DATABASE,
        "message": "MongoDB connectivity check failed: Connection timeout.",
    }
    with patch("app.api.routes.health.db_manager.check_health", return_value=mock_health):
        response = client.get(f"{settings.API_V1_PREFIX}/health/database")
        assert response.status_code == 503
        data = response.json()
        assert data.get("status") == "unhealthy"
        assert data.get("connected") is False
