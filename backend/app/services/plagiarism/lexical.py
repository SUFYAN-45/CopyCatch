"""Lexical similarity engine using TF-IDF and n-gram overlap analysis."""

import math
from typing import List, Set
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class LexicalSimilarityEngine:
    """Computes lexical, exact, and n-gram matching similarities between texts."""

    @staticmethod
    def get_word_ngrams(tokens: List[str], n: int = 3) -> Set[str]:
        """Generate word n-grams from a token list."""
        if len(tokens) < n:
            return set()
        return {" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)}

    @classmethod
    def compute_ngram_containment(
        cls, query_text: str, ref_text: str, n: int = 3
    ) -> float:
        """Calculate n-gram containment: proportion of query n-grams present in reference."""
        q_tokens = query_text.split()
        r_tokens = ref_text.split()

        if len(q_tokens) < n:
            # Fall back to unigram jaccard for very short sequences
            q_set = set(q_tokens)
            r_set = set(r_tokens)
            if not q_set:
                return 0.0
            return len(q_set.intersection(r_set)) / len(q_set)

        q_ngrams = cls.get_word_ngrams(q_tokens, n=n)
        r_ngrams = cls.get_word_ngrams(r_tokens, n=n)

        if not q_ngrams:
            return 0.0

        overlap = len(q_ngrams.intersection(r_ngrams))
        return overlap / len(q_ngrams)

    @staticmethod
    def compute_tfidf_similarity(text_a: str, text_b: str) -> float:
        """Compute document-level TF-IDF cosine similarity across word 1-to-3 grams."""
        if not text_a.strip() or not text_b.strip():
            return 0.0

        if text_a.strip() == text_b.strip():
            return 1.0

        try:
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 3),
                analyzer="word",
                sublinear_tf=True,
                token_pattern=r"(?u)\b\w+\b",
            )
            tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
            cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            if math.isnan(cos_sim):
                return 0.0
            return float(max(0.0, min(1.0, cos_sim)))
        except ValueError:
            # Empty vocabulary or non-alphanumeric text
            return 0.0

    @classmethod
    def compute_chunk_lexical_similarity(cls, chunk_a: str, chunk_b: str) -> float:
        """Compute localized lexical similarity between two individual chunks."""
        if not chunk_a.strip() or not chunk_b.strip():
            return 0.0

        if chunk_a.strip() == chunk_b.strip():
            return 1.0

        # Unigram Jaccard similarity
        tokens_a = set(chunk_a.split())
        tokens_b = set(chunk_b.split())
        jaccard = (
            len(tokens_a.intersection(tokens_b)) / len(tokens_a.union(tokens_b))
            if tokens_a and tokens_b
            else 0.0
        )

        # 3-gram containment
        containment = cls.compute_ngram_containment(chunk_a, chunk_b, n=3)

        # Blend unigram Jaccard (40%) and 3-gram containment (60%)
        combined = (0.4 * jaccard) + (0.6 * containment)
        return float(max(0.0, min(1.0, combined)))


lexical_engine = LexicalSimilarityEngine()
