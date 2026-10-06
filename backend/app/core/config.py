"""Application configuration using Pydantic Settings."""

import json
from pathlib import Path
from typing import List, Set, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base backend directory: .../backend
BACKEND_BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Core settings for CopyCatch backend."""

    PROJECT_NAME: str = "CopyCatch"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Local Storage Configuration
    DATA_DIR: Path = BACKEND_BASE_DIR / "data"
    UPLOADS_DIR: Path = BACKEND_BASE_DIR / "data" / "uploads"
    REFERENCE_DOCS_DIR: Path = BACKEND_BASE_DIR / "data" / "reference_documents"
    REPORTS_DIR: Path = BACKEND_BASE_DIR / "data" / "reports"

    # Upload & File Validation Settings
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    ALLOWED_EXTENSIONS: Set[str] = {".txt", ".pdf", ".docx"}

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from a JSON array or comma-separated string."""
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v


settings = Settings()
