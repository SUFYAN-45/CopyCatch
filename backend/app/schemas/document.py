"""Document metadata schemas."""

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4
from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    """Metadata representing an uploaded or stored document."""

    document_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier for the document")
    filename: str = Field(..., description="Sanitized original filename")
    file_type: str = Field(..., description="Normalized file extension (e.g., .txt, .pdf, .docx)")
    size: int = Field(..., ge=0, description="File size in bytes")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp of document ingestion",
    )
