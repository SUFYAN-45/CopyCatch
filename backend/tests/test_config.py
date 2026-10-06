"""Tests for application configuration settings."""

from pathlib import Path
from app.core.config import Settings


def test_default_settings() -> None:
    """Verify default settings values for CopyCatch with local storage."""
    settings = Settings()
    assert settings.PROJECT_NAME == "CopyCatch"
    assert settings.VERSION == "0.1.0"
    assert settings.ENVIRONMENT == "development"
    assert settings.API_V1_PREFIX == "/api/v1"
    assert isinstance(settings.DATA_DIR, Path)
    assert isinstance(settings.UPLOADS_DIR, Path)
    assert isinstance(settings.REFERENCE_DOCS_DIR, Path)
    assert isinstance(settings.REPORTS_DIR, Path)
    assert settings.MAX_UPLOAD_SIZE_BYTES == 15 * 1024 * 1024
    assert ".txt" in settings.ALLOWED_EXTENSIONS
    assert ".pdf" in settings.ALLOWED_EXTENSIONS
    assert ".docx" in settings.ALLOWED_EXTENSIONS


def test_cors_origins_parsing() -> None:
    """Verify CORS origins parsing from string or list."""
    settings = Settings(BACKEND_CORS_ORIGINS=["http://localhost:3000"])
    assert "http://localhost:3000" in settings.BACKEND_CORS_ORIGINS

    settings_comma = Settings(BACKEND_CORS_ORIGINS="http://localhost:3000, http://localhost:8080")
    assert "http://localhost:3000" in settings_comma.BACKEND_CORS_ORIGINS
    assert "http://localhost:8080" in settings_comma.BACKEND_CORS_ORIGINS
