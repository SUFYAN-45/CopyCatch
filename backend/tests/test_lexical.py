"""Tests for the lexical similarity engine."""

from app.services.plagiarism.lexical import LexicalSimilarityEngine, lexical_engine


def test_tfidf_identical_text() -> None:
    """Verify identical text produces 1.0 TF-IDF similarity."""
    text = "Machine learning algorithms build a mathematical model based on sample data."
    sim = lexical_engine.compute_tfidf_similarity(text, text)
    assert sim == 1.0


def test_tfidf_unrelated_text() -> None:
    """Verify unrelated texts produce very low TF-IDF similarity."""
    text_a = "Quantum computing relies on superposition and entanglement of qubits."
    text_b = "Ancient Roman architecture featured monumental aqueducts and arches."
    sim = lexical_engine.compute_tfidf_similarity(text_a, text_b)
    assert sim < 0.15


def test_ngram_containment_copied_vs_unrelated() -> None:
    """Verify n-gram containment detects copied phrases and scores unrelated text 0.0."""
    ref = "artificial intelligence and machine learning are revolutionizing software development across industries"
    copied = "artificial intelligence and machine learning are revolutionizing modern applications"
    unrelated = "baking sourdough bread requires organic flour and precise temperature fermentation"

    containment_copied = lexical_engine.compute_ngram_containment(copied, ref, n=3)
    containment_unrelated = lexical_engine.compute_ngram_containment(unrelated, ref, n=3)

    assert containment_copied > 0.4
    assert containment_unrelated == 0.0


def test_chunk_lexical_similarity_identical() -> None:
    """Verify identical chunks produce 1.0 lexical similarity."""
    chunk = "photosynthesis converts solar light into chemical energy stored in carbohydrates"
    sim = lexical_engine.compute_chunk_lexical_similarity(chunk, chunk)
    assert sim == 1.0


def test_chunk_lexical_similarity_empty() -> None:
    """Verify empty input returns 0.0."""
    assert lexical_engine.compute_chunk_lexical_similarity("", "sample text") == 0.0
    assert lexical_engine.compute_chunk_lexical_similarity("sample text", "") == 0.0
