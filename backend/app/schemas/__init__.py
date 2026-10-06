"""Schemas package for CopyCatch."""

from app.schemas.analysis import AnalysisResult, Match, MatchLocation
from app.schemas.document import DocumentMetadata

__all__ = [
    "AnalysisResult",
    "DocumentMetadata",
    "Match",
    "MatchLocation",
]
