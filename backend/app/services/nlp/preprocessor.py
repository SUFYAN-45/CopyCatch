"""NLP preprocessing service for text cleaning, normalization, and chunking."""

from dataclasses import dataclass
import re
from typing import List, Tuple


@dataclass
class TextChunk:
    """Represents an atomic text segment for similarity analysis."""

    chunk_index: int
    text: str
    lexical_text: str
    start_char: int
    end_char: int


class TextPreprocessor:
    """Handles text cleaning, representation formatting, and sentence/chunk windowing."""

    @staticmethod
    def normalize_text(text: str) -> str:
        """Clean and normalize raw text preserving semantic structure and casing."""
        if not text:
            return ""
        # Standardize carriage returns, tabs, non-breaking spaces
        cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
        cleaned = re.sub(r"[\t\f\v\u00a0\u200b]+", " ", cleaned)
        # Collapse multiple horizontal spaces
        cleaned = re.sub(r" {2,}", " ", cleaned)
        # Collapse multiple blank lines
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    @staticmethod
    def to_lexical_text(text: str) -> str:
        """Create a normalized lexical representation for exact and fuzzy matching.

        Lowercases text, removes disruptive punctuation while keeping alphanumeric tokens,
        and preserves word boundaries without stripping stopwords.
        """
        if not text:
            return ""
        lowered = text.lower()
        # Keep alphanumeric characters and basic spacing
        cleaned = re.sub(r"[^\w\s]", " ", lowered)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned.strip()

    @classmethod
    def split_sentences(cls, text: str) -> List[Tuple[str, int, int]]:
        """Split text into sentences while recording starting and ending character offsets."""
        normalized = cls.normalize_text(text)
        if not normalized:
            return []

        # Split on sentence terminals followed by whitespace or line break
        pattern = r"(?<=[.!?])\s+"
        sentences: List[Tuple[str, int, int]] = []
        curr_offset = 0

        raw_parts = re.split(pattern, normalized)
        for part in raw_parts:
            part_clean = part.strip()
            if not part_clean:
                continue

            # Locate the sentence within normalized text to get real offsets
            start = normalized.find(part_clean, curr_offset)
            if start == -1:
                start = curr_offset
            end = start + len(part_clean)
            sentences.append((part_clean, start, end))
            curr_offset = end

        return sentences

    @classmethod
    def chunk_document(
        cls,
        text: str,
        target_words: int = 50,
        min_words: int = 15,
        overlap_sentences: int = 1,
    ) -> List[TextChunk]:
        """Split document into meaningful, overlapping chunks for fine-grained matching.

        Avoids micro-chunks and keeps character boundaries for highlight display.
        """
        sentences = cls.split_sentences(text)
        if not sentences:
            return []

        # If document is short, return entire document as a single chunk
        total_words = len(text.split())
        if total_words <= target_words or len(sentences) <= 1:
            full_norm = cls.normalize_text(text)
            return [
                TextChunk(
                    chunk_index=0,
                    text=full_norm,
                    lexical_text=cls.to_lexical_text(full_norm),
                    start_char=0,
                    end_char=len(full_norm),
                )
            ]

        chunks: List[TextChunk] = []
        i = 0
        chunk_idx = 0

        while i < len(sentences):
            current_sentences = []
            word_count = 0
            start_offset = sentences[i][1]
            end_offset = sentences[i][2]

            j = i
            while j < len(sentences):
                s_text, s_start, s_end = sentences[j]
                s_words = len(s_text.split())

                current_sentences.append(s_text)
                word_count += s_words
                end_offset = s_end
                j += 1

                # Reached reasonable chunk size
                if word_count >= target_words:
                    break

            combined_text = " ".join(current_sentences)
            chunks.append(
                TextChunk(
                    chunk_index=chunk_idx,
                    text=combined_text,
                    lexical_text=cls.to_lexical_text(combined_text),
                    start_char=start_offset,
                    end_char=end_offset,
                )
            )
            chunk_idx += 1

            # Advance with overlap
            advance = max(1, len(current_sentences) - overlap_sentences)
            i += advance

        return chunks

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 300, overlap: int = 50) -> List[str]:
        """Backward-compatible word-window chunking helper."""
        words = text.split()
        if len(words) <= chunk_size:
            return [" ".join(words)] if words else []

        chunks: List[str] = []
        start = 0
        step = max(1, chunk_size - overlap)

        while start < len(words):
            chunk_words = words[start : start + chunk_size]
            chunks.append(" ".join(chunk_words))
            start += step

        return chunks


text_preprocessor = TextPreprocessor()
