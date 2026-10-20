"""Document metadata schemas."""

from datetime import datetime, timezone
from typing import Dict, Optional
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
    word_count: Optional[int] = Field(default=None, description="Total word count of document")
    execution_time_ms: Optional[int] = Field(default=None, description="Execution time in milliseconds")
    filters_applied: Optional[Dict[str, bool]] = Field(default=None, description="Applied filters")
