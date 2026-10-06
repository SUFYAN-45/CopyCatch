"""Document extraction service boundary.

Defines the extraction contract and boundaries for extracting plain text
from supported document formats (.txt, .pdf, .docx).
Full multi-format engine integration will be completed in the NLP engine phase.
"""

from pathlib import Path
from typing import Union


class DocumentExtractor:
    """Service boundary for document content extraction."""

    SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".docx"}

    @classmethod
    def extract_text(cls, file_path: Union[str, Path]) -> str:
        """Extract text from the specified document path according to file type."""
        path = Path(file_path)
        ext = path.suffix.lower()

        if ext not in cls.SUPPORTED_EXTENSIONS:
            raise ValueError(f"Unsupported document format '{ext}' for text extraction.")

        if ext == ".txt":
            return cls._extract_txt(path)
        elif ext == ".pdf":
            return cls._extract_pdf(path)
        elif ext == ".docx":
            return cls._extract_docx(path)
        else:
            raise NotImplementedError(f"Extractor for format {ext} is not yet implemented.")

    @staticmethod
    def _extract_txt(path: Path) -> str:
        """Extract text from a plain-text file."""
        try:
            return path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            # Fallback with error replacement for non-standard encodings
            return path.read_text(encoding="latin-1", errors="replace")

    @staticmethod
    def _extract_pdf(path: Path) -> str:
        """PDF extraction boundary (to be powered by PDF parser in upcoming engine phase)."""
        raise NotImplementedError("PDF text extraction will be implemented in the NLP engine phase.")

    @staticmethod
    def _extract_docx(path: Path) -> str:
        """DOCX extraction boundary (to be powered by DOCX parser in upcoming engine phase)."""
        raise NotImplementedError("DOCX text extraction will be implemented in the NLP engine phase.")


document_extractor = DocumentExtractor()
