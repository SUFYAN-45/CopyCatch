"""Tests for configuration settings."""

from app.core.config import Settings


def test_default_settings() -> None:
    """Verify default settings values for CopyCatch."""
    settings = Settings()
    assert settings.PROJECT_NAME == "CopyCatch"
    assert settings.VERSION == "0.1.0"
    assert settings.ENVIRONMENT == "development"
    assert settings.API_V1_PREFIX == "/api/v1"
    assert settings.MONGODB_DATABASE == "copycatch"


def test_mongodb_configured_property() -> None:
    """Verify is_mongodb_configured property logic."""
    settings_empty = Settings(MONGODB_URI="")
    assert settings_empty.is_mongodb_configured is False

    settings_configured = Settings(MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/test")
    assert settings_configured.is_mongodb_configured is True
