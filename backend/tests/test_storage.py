"""Tests for local storage service and service boundaries."""

from pathlib import Path
import pytest

from app.schemas.analysis import AnalysisResult, Match
from app.services.document.extractor import DocumentExtractor
from app.services.nlp.preprocessor import TextPreprocessor
from app.services.plagiarism.detector import PlagiarismDetector
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


def test_save_and_get_report(temp_storage: LocalStorageService) -> None:
    """Verify persisting and retrieving an analysis report JSON."""
    match = Match(source="ref.txt", matched_text="snippet", similarity_score=0.88)
    report = AnalysisResult(
        document_id="doc_xyz",
        overall_similarity=0.75,
        semantic_similarity=0.80,
        lexical_similarity=0.70,
        matches=[match],
    )

    report_path = temp_storage.save_report(report)
    assert report_path.is_file()
    assert report_path.name == f"analysis_{report.analysis_id}.json"

    retrieved = temp_storage.get_report(report.analysis_id)
    assert retrieved is not None
    assert retrieved["analysis_id"] == report.analysis_id
    assert retrieved["document_id"] == "doc_xyz"
    assert retrieved["overall_similarity"] == 0.75
    assert len(retrieved["matches"]) == 1

    report_ids = temp_storage.list_reports()
    assert report.analysis_id in report_ids


def test_get_nonexistent_report(temp_storage: LocalStorageService) -> None:
    """Verify retrieving a non-existent report returns None."""
    assert temp_storage.get_report("nonexistent_id") is None


def test_document_extractor_boundary(tmp_path: Path) -> None:
    """Verify DocumentExtractor extracts text for .txt and handles unsupported formats."""
    sample_txt = tmp_path / "sample.txt"
    sample_txt.write_text("Hello from CopyCatch extraction boundary.", encoding="utf-8")

    extracted = DocumentExtractor.extract_text(sample_txt)
    assert "Hello from CopyCatch" in extracted

    sample_pdf = tmp_path / "sample.pdf"
    sample_pdf.write_bytes(b"%PDF-1.4 test")
    with pytest.raises(NotImplementedError):
        DocumentExtractor.extract_text(sample_pdf)

    with pytest.raises(ValueError):
        DocumentExtractor.extract_text(tmp_path / "sample.mp3")


def test_nlp_preprocessor_boundary() -> None:
    """Verify TextPreprocessor normalizes and chunks text."""
    raw = "   This   is   a   test\r\n\r\nwith irregular   spaces.   "
    normalized = TextPreprocessor.normalize_text(raw)
    assert "  " not in normalized
    assert normalized.startswith("This")

    chunks = TextPreprocessor.chunk_text("word " * 100, chunk_size=30, overlap=10)
    assert len(chunks) > 1


def test_plagiarism_detector_boundary() -> None:
    """Verify PlagiarismDetector lexical similarity and hybrid calculation."""
    tokens_a = ["machine", "learning", "natural", "language"]
    tokens_b = ["natural", "language", "processing", "deep"]
    sim = PlagiarismDetector.calculate_lexical_similarity(tokens_a, tokens_b)
    assert 0.0 < sim < 1.0

    hybrid = PlagiarismDetector.calculate_hybrid_score(0.8, 0.4, semantic_weight=0.5)
    assert hybrid == 0.60
