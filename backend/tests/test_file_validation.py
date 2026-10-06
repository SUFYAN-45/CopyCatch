"""Tests for filename sanitization and file validation utilities."""

from app.utils.file_validation import (
    is_supported_extension,
    sanitize_filename,
    validate_uploaded_file,
)


def test_filename_sanitization_path_traversal() -> None:
    """Verify that path traversal sequences are completely stripped."""
    assert sanitize_filename("../../etc/passwd.txt") == "passwd.txt"
    assert sanitize_filename("..\\..\\windows\\system32\\calc.txt") == "calc.txt"
    assert sanitize_filename("/var/log/document.pdf") == "document.pdf"
    assert sanitize_filename("C:\\Users\\test\\my_essay.docx") == "my_essay.docx"


def test_filename_sanitization_special_characters() -> None:
    """Verify that unsafe characters, spaces, and duplicate symbols are cleaned."""
    assert sanitize_filename("my project @ # $ final.txt") == "my_project_final.txt"
    assert sanitize_filename("sample (1) [copy].pdf") == "sample_1_copy.pdf"
    assert sanitize_filename("weird___chars...txt") == "weird_chars.txt"


def test_filename_sanitization_empty_and_reserved() -> None:
    """Verify fallback for empty filenames and Windows reserved names."""
    assert sanitize_filename("") == "unnamed_document.txt"
    assert sanitize_filename("   ") == "unnamed_document.txt"
    assert sanitize_filename("CON.txt") == "safe_CON.txt"
    assert sanitize_filename("aux.pdf") == "safe_aux.pdf"


def test_supported_extensions() -> None:
    """Verify supported extensions detection (case-insensitive)."""
    assert is_supported_extension("paper.txt") is True
    assert is_supported_extension("PAPER.TXT") is True
    assert is_supported_extension("thesis.pdf") is True
    assert is_supported_extension("Thesis.PDF") is True
    assert is_supported_extension("report.docx") is True
    assert is_supported_extension("Report.DOCX") is True


def test_unsupported_extensions() -> None:
    """Verify unsupported extensions are rejected."""
    assert is_supported_extension("malware.exe") is False
    assert is_supported_extension("script.py") is False
    assert is_supported_extension("shell.sh") is False
    assert is_supported_extension("image.png") is False
    assert is_supported_extension("old_doc.doc") is False


def test_validate_uploaded_file_valid_txt() -> None:
    """Verify valid .txt file passes validation."""
    content = b"This is a sample document for plagiarism detection testing."
    is_valid, error = validate_uploaded_file("document.txt", content, content_type="text/plain")
    assert is_valid is True
    assert error is None


def test_validate_uploaded_file_valid_pdf() -> None:
    """Verify valid .pdf file with %PDF- header passes validation."""
    content = b"%PDF-1.5 test pdf content"
    is_valid, error = validate_uploaded_file("paper.pdf", content, content_type="application/pdf")
    assert is_valid is True
    assert error is None


def test_validate_uploaded_file_invalid_pdf_header() -> None:
    """Verify PDF without %PDF- header is rejected."""
    content = b"Fake PDF text without magic bytes"
    is_valid, error = validate_uploaded_file("paper.pdf", content, content_type="application/pdf")
    assert is_valid is False
    assert "PDF header signature" in error


def test_validate_uploaded_file_valid_docx() -> None:
    """Verify valid DOCX starting with PK zip header passes validation."""
    content = b"PK\x03\x04mock docx zip stream"
    is_valid, error = validate_uploaded_file(
        "thesis.docx",
        content,
        content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    assert is_valid is True
    assert error is None


def test_validate_uploaded_file_invalid_docx_header() -> None:
    """Verify DOCX missing zip magic header is rejected."""
    content = b"Not a real docx archive"
    is_valid, error = validate_uploaded_file("thesis.docx", content)
    assert is_valid is False
    assert "DOCX zip container signature" in error


def test_validate_uploaded_file_empty_content() -> None:
    """Verify 0-byte file is rejected."""
    is_valid, error = validate_uploaded_file("empty.txt", b"")
    assert is_valid is False
    assert "empty" in error


def test_validate_uploaded_file_size_limit() -> None:
    """Verify file exceeding size limit is rejected."""
    content = b"A" * 1024
    is_valid, error = validate_uploaded_file("too_big.txt", content, max_size_bytes=512)
    assert is_valid is False
    assert "exceeds maximum allowed limit" in error


def test_validate_uploaded_file_unsupported_extension() -> None:
    """Verify unsupported file extension is rejected during upload validation."""
    content = b"print('hello')"
    is_valid, error = validate_uploaded_file("script.py", content)
    assert is_valid is False
    assert "Unsupported file extension" in error


def test_validate_uploaded_file_mismatched_mime() -> None:
    """Verify mismatched MIME type is rejected."""
    content = b"Plain text"
    is_valid, error = validate_uploaded_file("sample.txt", content, content_type="image/jpeg")
    assert is_valid is False
    assert "Content-Type" in error
