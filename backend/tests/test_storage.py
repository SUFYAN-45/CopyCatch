"""Tests for local storage service and reference corpus management."""

from pathlib import Path
import pytest

from app.schemas.analysis import AnalysisResult, Match
from app.services.storage.local_storage import LocalStorageService


@pytest.fixture
def temp_storage(tmp_path: Path) -> LocalStorageService:
    """Fixture providing an isolated LocalStorageService backed by a temporary directory."""
    uploads = tmp_path / "uploads"
    references = tmp_path / "reference_documents"
    reports = tmp_path / "reports"
    return LocalStorageService(
        uploads_dir=uploads,
        reference_dir=references,
        reports_dir=reports,
    )


def test_save_upload_and_metadata(temp_storage: LocalStorageService) -> None:
    """Verify saving an uploaded document creates file and returns accurate metadata."""
    content = b"Sample text file content for analysis."
    path, meta = temp_storage.save_upload(filename="assignment 1.txt", content=content)

    assert path.is_file()
    assert path.read_bytes() == content
    assert meta.filename == "assignment_1.txt"
    assert meta.file_type == ".txt"
    assert meta.size == len(content)


def test_save_reference_document(temp_storage: LocalStorageService) -> None:
    """Verify saving a reference corpus document."""
    content = b"Reference corpus source text."
    path, meta = temp_storage.save_reference_document(filename="source_ref.txt", content=content)

    assert path.is_file()
    assert meta.filename == "source_ref.txt"
    assert meta.size == len(content)


def test_reference_corpus_operations(temp_storage: LocalStorageService) -> None:
    """Verify listing and deleting reference documents."""
    temp_storage.save_reference_document("ref1.txt", b"Document 1")
    temp_storage.save_reference_document("ref2.txt", b"Document 2")

    refs = temp_storage.list_reference_documents()
    assert len(refs) == 2
    filenames = [r.filename for r in refs]
    assert "ref1.txt" in filenames
    assert "ref2.txt" in filenames

    # Delete reference
    deleted = temp_storage.delete_reference_document("ref1.txt")
    assert deleted is True

    # Check list after deletion
    refs_after = temp_storage.list_reference_documents()
    assert len(refs_after) == 1
    assert refs_after[0].filename == "ref2.txt"

    # Delete non-existent
    assert temp_storage.delete_reference_document("nonexistent.txt") is False


def test_save_and_get_report(temp_storage: LocalStorageService) -> None:
    """Verify persisting and retrieving an analysis report JSON."""
    match = Match(
        source="ref.txt",
        submitted_text="query snippet",
        matched_text="reference snippet",
        similarity_score=88.0,
        match_type="hybrid",
    )
    report = AnalysisResult(
        document_id="doc_xyz",
        overall_similarity=75.0,
        semantic_similarity=80.0,
        lexical_similarity=70.0,
        classification="High Similarity",
        matches=[match],
    )

    report_path = temp_storage.save_report(report)
    assert report_path.is_file()
    assert report_path.name == f"analysis_{report.analysis_id}.json"

    retrieved = temp_storage.get_report(report.analysis_id)
    assert retrieved is not None
    assert retrieved["analysis_id"] == report.analysis_id
    assert retrieved["document_id"] == "doc_xyz"
    assert retrieved["overall_similarity"] == 75.0
    assert len(retrieved["matches"]) == 1

    report_ids = temp_storage.list_reports()
    assert report.analysis_id in report_ids


def test_get_nonexistent_report(temp_storage: LocalStorageService) -> None:
    """Verify retrieving a non-existent report returns None."""
    assert temp_storage.get_report("nonexistent_id") is None
