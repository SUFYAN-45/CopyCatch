"""Tests for document extraction across TXT, PDF, and DOCX formats."""

import io
from pathlib import Path
import docx
import pytest

from app.services.document.extractor import (
    DocumentEmptyError,
    DocumentExtractionError,
    DocumentExtractor,
    UnsupportedFormatError,
)


def make_minimal_pdf(text: str) -> bytes:
    """Create valid binary content for a single-page PDF containing the specified text."""
    stream = f"BT /F1 12 Tf 10 50 Td ({text}) Tj ET"
    stream_len = len(stream)
    pdf = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length {stream_len} >> stream
{stream}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
400
%%EOF"""
    return pdf.encode("latin-1")


def test_extract_txt_utf8(tmp_path: Path) -> None:
    """Verify extraction of plain-text documents encoded in UTF-8."""
    txt_file = tmp_path / "sample.txt"
    txt_file.write_text("CopyCatch text extraction test with UTF-8 symbols: © 2026.", encoding="utf-8")

    extracted = DocumentExtractor.extract_text(txt_file)
    assert "CopyCatch text extraction test" in extracted
    assert "2026" in extracted


def test_extract_txt_latin1_fallback(tmp_path: Path) -> None:
    """Verify fallback extraction for non-UTF8 encoded plain-text files."""
    txt_file = tmp_path / "latin1.txt"
    # Write bytes with latin-1 specific character not valid in strict utf-8
    txt_file.write_bytes("Resumé and Café".encode("latin-1"))

    extracted = DocumentExtractor.extract_text(txt_file)
    assert "Caf" in extracted


def test_extract_pdf_valid(tmp_path: Path) -> None:
    """Verify extraction of text from a valid PDF document."""
    pdf_file = tmp_path / "valid.pdf"
    pdf_file.write_bytes(make_minimal_pdf("Intelligent Plagiarism Detection System"))

    extracted = DocumentExtractor.extract_text(pdf_file)
    assert "Intelligent Plagiarism Detection System" in extracted


def test_extract_docx_valid(tmp_path: Path) -> None:
    """Verify extraction of text from a valid DOCX document with paragraphs and table."""
    docx_file = tmp_path / "valid.docx"
    doc = docx.Document()
    doc.add_heading("Section 1: Academic Integrity", level=1)
    doc.add_paragraph("Plagiarism involves presenting someone else's work as your own.")

    # Add a table
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).text = "Term"
    table.cell(0, 1).text = "Definition"
    table.cell(1, 0).text = "Paraphrasing"
    table.cell(1, 1).text = "Rewording with source attribution"

    doc.save(str(docx_file))

    extracted = DocumentExtractor.extract_text(docx_file)
    assert "Section 1: Academic Integrity" in extracted
    assert "Plagiarism involves presenting" in extracted
    assert "Paraphrasing" in extracted


def test_extract_empty_file_raises_error(tmp_path: Path) -> None:
    """Verify 0-byte document raises DocumentEmptyError."""
    empty_file = tmp_path / "empty.txt"
    empty_file.write_bytes(b"")

    with pytest.raises(DocumentEmptyError, match="is empty"):
        DocumentExtractor.extract_text(empty_file)


def test_extract_whitespace_only_raises_error(tmp_path: Path) -> None:
    """Verify document with only whitespace raises DocumentEmptyError."""
    space_file = tmp_path / "spaces.txt"
    space_file.write_text("   \n\n\t\t   ", encoding="utf-8")

    with pytest.raises(DocumentEmptyError, match="no readable text content"):
        DocumentExtractor.extract_text(space_file)


def test_extract_corrupted_pdf_raises_error(tmp_path: Path) -> None:
    """Verify corrupted PDF bytes raise DocumentExtractionError."""
    corrupt_pdf = tmp_path / "corrupt.pdf"
    corrupt_pdf.write_bytes(b"%PDF-1.4 this is completely corrupted binary garbage \x00\xff\xee")

    with pytest.raises(DocumentExtractionError):
        DocumentExtractor.extract_text(corrupt_pdf)


def test_extract_corrupted_docx_raises_error(tmp_path: Path) -> None:
    """Verify corrupted DOCX (invalid zip) raises DocumentExtractionError."""
    corrupt_docx = tmp_path / "corrupt.docx"
    corrupt_docx.write_bytes(b"PK\x03\x04 not a valid zip container")

    with pytest.raises(DocumentExtractionError):
        DocumentExtractor.extract_text(corrupt_docx)


def test_extract_unsupported_format_raises_error(tmp_path: Path) -> None:
    """Verify unsupported file formats raise UnsupportedFormatError."""
    unsupported = tmp_path / "song.mp3"
    unsupported.write_bytes(b"audio content")

    with pytest.raises(UnsupportedFormatError, match="Unsupported format"):
        DocumentExtractor.extract_text(unsupported)
