"""NLP preprocessing service boundary.

Handles text normalization, cleaning, and text chunking for downstream similarity analysis.
"""

import re
from typing import List


class TextPreprocessor:
    """Service boundary for text normalization and chunking."""

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize input text by standardizing whitespace, casing, and basic punctuation."""
        if not text:
            return ""
        # Replace non-breaking spaces and irregular whitespace
        cleaned = re.sub(r"[\r\t\f\v]+", " ", text)
        # Collapse multiple spaces
        cleaned = re.sub(r" +", " ", cleaned)
        # Collapse excessive newlines
        cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
        return cleaned.strip()

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> List[str]:
        """Split text into manageable overlapping chunks of words for granular matching."""
        if not text or not text.strip():
            return []

        words = text.split()
        if len(words) <= chunk_size:
            return [" ".join(words)]

        chunks: List[str] = []
        start = 0
        step = max(1, chunk_size - overlap)

        while start < len(words):
            chunk_words = words[start : start + chunk_size]
            chunks.append(" ".join(chunk_words))
            start += step

        return chunks


text_preprocessor = TextPreprocessor()
