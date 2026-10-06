"""Analysis and plagiarism detection schemas."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field

from app.schemas.document import DocumentMetadata


class MatchLocation(BaseModel):
    """Optional location details for a detected text match."""

    chunk_index: Optional[int] = Field(default=None, description="Index of the matching chunk")
    start_char: Optional[int] = Field(default=None, description="Starting character offset in submitted text")
    end_char: Optional[int] = Field(default=None, description="Ending character offset in submitted text")
    page: Optional[int] = Field(default=None, description="Page number if applicable")
    extra: Optional[Dict[str, Any]] = Field(default=None, description="Additional context or coordinate data")


class Match(BaseModel):
    """Represents a specific matched segment between two documents."""

    source: str = Field(..., description="Filename or identifier of the matching reference document")
    submitted_text: str = Field(..., description="Excerpt or snippet from the submitted document")
    matched_text: str = Field(..., description="Excerpt or snippet from the reference document")
    similarity_score: float = Field(..., ge=0.0, le=100.0, description="Similarity score between 0.0 and 100.0")
    match_type: str = Field(default="hybrid", description="Type of match: 'semantic', 'lexical', or 'hybrid'")
    location: Optional[Dict[str, Any]] = Field(default=None, description="Location information if available")


class AnalysisResult(BaseModel):
    """Result of a plagiarism detection analysis on a document."""

    analysis_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier for the analysis")
    document_id: Optional[str] = Field(default=None, description="ID of the analyzed target document")
    document: Optional[DocumentMetadata] = Field(default=None, description="Document metadata")
    overall_similarity: float = Field(..., ge=0.0, le=100.0, description="Overall hybrid similarity score (0.0 to 100.0)")
    semantic_similarity: float = Field(..., ge=0.0, le=100.0, description="Semantic similarity score (0.0 to 100.0)")
    lexical_similarity: float = Field(..., ge=0.0, le=100.0, description="Lexical similarity score (0.0 to 100.0)")
    classification: str = Field(default="Very Low Similarity", description="Descriptive similarity category")
    matches: List[Match] = Field(default_factory=list, description="Collection of matching segments")
    analyzed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when the analysis was performed",
    )
    message: Optional[str] = Field(default=None, description="Supplementary status message or note")


class ReferenceDocumentInfo(BaseModel):
    """Information summary for an indexed reference document."""

    filename: str
    size: int
    modified_at: datetime
