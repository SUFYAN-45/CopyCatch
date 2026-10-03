"""Health check routes."""

from fastapi import APIRouter, Response, status
from app.core.config import settings
from app.core.database import db_manager

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Backend Service Health Check")
async def backend_health_check() -> dict:
    """Return the health status of the FastAPI backend process."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/database", summary="Database Connectivity Health Check")
async def database_health_check(response: Response) -> dict:
    """Verify connectivity to MongoDB Atlas.

    Distinguishes between unconfigured development mode, active healthy connection,
    and connectivity failure (HTTP 503).
    """
    health = db_manager.check_health()
    if health["status"] == "unhealthy":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return health
