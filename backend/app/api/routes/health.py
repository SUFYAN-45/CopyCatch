"""Health check routes."""

from fastapi import APIRouter
from app.core.config import settings

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
