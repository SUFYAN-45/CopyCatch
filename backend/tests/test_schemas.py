"""Tests for document and analysis schemas."""

from datetime import datetime
import pytest
from pydantic import ValidationError

from app.schemas.analysis import AnalysisResult, Match, MatchLocation, ReferenceDocumentInfo
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
    location = {"start_char": 10, "end_char": 50, "page": 1}
    match = Match(
        source="ref_document_01.txt",
        submitted_text="The quick brown fox jumps over the lazy dog.",
        matched_text="A quick brown fox leaps across the lazy hound.",
        similarity_score=92.5,
        match_type="hybrid",
        location=location,
    )
    assert match.source == "ref_document_01.txt"
    assert match.similarity_score == 92.5
    assert match.match_type == "hybrid"
    assert match.location["start_char"] == 10


def test_match_schema_score_out_of_bounds() -> None:
    """Verify similarity score outside [0.0, 100.0] raises ValidationError."""
    with pytest.raises(ValidationError):
        Match(
            source="source.txt",
            submitted_text="test query",
            matched_text="test ref",
            similarity_score=105.0,
        )

    with pytest.raises(ValidationError):
        Match(
            source="source.txt",
            submitted_text="test query",
            matched_text="test ref",
            similarity_score=-1.0,
        )


def test_analysis_result_valid() -> None:
    """Verify AnalysisResult schema validates correctly with nested matches and classification."""
    match = Match(
        source="corpus_item_42.txt",
        submitted_text="Natural language processing enables intelligent text comparison.",
        matched_text="Natural language processing powers smart text comparison.",
        similarity_score=85.0,
        match_type="semantic",
    )
    result = AnalysisResult(
        document_id="doc_abc_123",
        overall_similarity=78.5,
        semantic_similarity=82.0,
        lexical_similarity=72.0,
        classification="High Similarity",
        matches=[match],
    )
    assert result.document_id == "doc_abc_123"
    assert result.overall_similarity == 78.5
    assert result.classification == "High Similarity"
    assert len(result.matches) == 1
    assert isinstance(result.analysis_id, str)
    assert isinstance(result.analyzed_at, datetime)


def test_analysis_result_score_bounds() -> None:
    """Verify AnalysisResult rejects invalid similarity scores outside [0, 100]."""
    with pytest.raises(ValidationError):
        AnalysisResult(
            overall_similarity=101.0,  # Out of bounds
            semantic_similarity=50.0,
            lexical_similarity=50.0,
        )


def test_reference_document_info_schema() -> None:
    """Verify ReferenceDocumentInfo schema parsing."""
    ref = ReferenceDocumentInfo(
        filename="source.pdf",
        size=4096,
        modified_at=datetime.now(),
    )
    assert ref.filename == "source.pdf"
    assert ref.size == 4096
