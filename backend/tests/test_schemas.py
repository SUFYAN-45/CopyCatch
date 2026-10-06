"""Tests for document and analysis schemas."""

from datetime import datetime
import pytest
from pydantic import ValidationError

from app.schemas.analysis import AnalysisResult, Match, MatchLocation
from app.schemas.document import DocumentMetadata


def test_document_metadata_valid() -> None:
    """Verify DocumentMetadata accepts valid inputs and sets auto-defaults."""
    doc = DocumentMetadata(
        filename="research_paper.pdf",
        file_type=".pdf",
        size=10240,
    )
    assert doc.filename == "research_paper.pdf"
    assert doc.file_type == ".pdf"
    assert doc.size == 10240
    assert isinstance(doc.document_id, str)
    assert len(doc.document_id) > 0
    assert isinstance(doc.created_at, datetime)


def test_document_metadata_invalid_size() -> None:
    """Verify negative file size raises validation error."""
    with pytest.raises(ValidationError):
        DocumentMetadata(
            filename="invalid.txt",
            file_type=".txt",
            size=-5,
        )


def test_match_schema_valid() -> None:
    """Verify Match schema accepts valid scoring and location data."""
    location = MatchLocation(start_char=10, end_char=50, page=1)
    match = Match(
        source="ref_document_01.txt",
        matched_text="The quick brown fox jumps over the lazy dog.",
        similarity_score=0.92,
        location=location,
    )
    assert match.source == "ref_document_01.txt"
    assert match.similarity_score == 0.92
    assert match.location.page == 1
    assert match.location.start_char == 10


def test_match_schema_score_out_of_bounds() -> None:
    """Verify similarity score outside [0.0, 1.0] raises ValidationError."""
    with pytest.raises(ValidationError):
        Match(
            source="source.txt",
            matched_text="test",
            similarity_score=1.5,
        )

    with pytest.raises(ValidationError):
        Match(
            source="source.txt",
            matched_text="test",
            similarity_score=-0.1,
        )


def test_analysis_result_valid() -> None:
    """Verify AnalysisResult schema validates correctly with nested matches."""
    match = Match(
        source="corpus_item_42.txt",
        matched_text="Natural language processing enables intelligent text comparison.",
        similarity_score=0.85,
    )
    result = AnalysisResult(
        document_id="doc_abc_123",
        overall_similarity=0.78,
        semantic_similarity=0.82,
        lexical_similarity=0.72,
        matches=[match],
    )
    assert result.document_id == "doc_abc_123"
    assert result.overall_similarity == 0.78
    assert len(result.matches) == 1
    assert isinstance(result.analysis_id, str)
    assert isinstance(result.analyzed_at, datetime)


def test_analysis_result_score_bounds() -> None:
    """Verify AnalysisResult rejects invalid similarity scores."""
    with pytest.raises(ValidationError):
        AnalysisResult(
            document_id="doc_1",
            overall_similarity=1.1,  # Out of bounds
            semantic_similarity=0.5,
            lexical_similarity=0.5,
        )
