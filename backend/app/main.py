"""CopyCatch FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import db_manager

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown lifecycle events."""
    logger.info("Starting up CopyCatch backend...")
    if settings.is_mongodb_configured:
        try:
            db_manager.connect()
        except Exception as err:
            logger.error("MongoDB connection failed on application startup: %s", err)
            raise
    else:
        logger.info("MongoDB URI is not configured. Backend starting in unconfigured database mode.")

    yield

    logger.info("Shutting down CopyCatch backend...")
    db_manager.close()


def create_application() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Set up CORS middleware for local frontend development
    if settings.BACKEND_CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Mount API routers under API prefix (e.g., /api/v1)
    application.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return application


app = create_application()
