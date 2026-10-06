"""Analysis and plagiarism detection schemas."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4
from pydantic import BaseModel, Field


class MatchLocation(BaseModel):
    """Optional location details for a detected text match."""

    start_char: Optional[int] = Field(default=None, description="Starting character offset")
    end_char: Optional[int] = Field(default=None, description="Ending character offset")
    page: Optional[int] = Field(default=None, description="Page number if applicable")
    paragraph: Optional[int] = Field(default=None, description="Paragraph index if applicable")
    extra: Optional[Dict[str, Any]] = Field(default=None, description="Additional context or coordinate data")


class Match(BaseModel):
    """Represents a specific matched segment between two documents."""

    source: str = Field(..., description="Identifier or filename of the matching source document")
    matched_text: str = Field(..., description="Excerpt or snippet of matching text")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score between 0.0 and 1.0")
    location: Optional[MatchLocation] = Field(default=None, description="Location information if available")


class AnalysisResult(BaseModel):
    """Result of a plagiarism detection analysis on a document."""

    analysis_id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier for the analysis")
    document_id: str = Field(..., description="ID of the analyzed target document")
    overall_similarity: float = Field(..., ge=0.0, le=1.0, description="Overall hybrid similarity score (0.0 to 1.0)")
    semantic_similarity: float = Field(..., ge=0.0, le=1.0, description="Semantic similarity score (0.0 to 1.0)")
    lexical_similarity: float = Field(..., ge=0.0, le=1.0, description="Lexical similarity score (0.0 to 1.0)")
    matches: List[Match] = Field(default_factory=list, description="Collection of matching segments")
    analyzed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp when the analysis was performed",
    )
