"""Tests for hybrid scoring, classification, and match detection."""

from app.services.nlp.preprocessor import TextPreprocessor
from app.services.nlp.semantic import semantic_engine
from app.services.plagiarism.detector import PlagiarismDetector, plagiarism_detector


def test_calculate_hybrid_score_default_weights() -> None:
    """Verify hybrid score with default 60% semantic and 40% lexical weights."""
    score = plagiarism_detector.calculate_hybrid_score(
        semantic_score=80.0,
        lexical_score=60.0,
        semantic_weight=0.6,
        lexical_weight=0.4,
    )
    # (0.6 * 80) + (0.4 * 60) = 48 + 24 = 72.0
    assert score == 72.0


def test_calculate_hybrid_score_custom_weights() -> None:
    """Verify hybrid score with customized weights."""
    score = plagiarism_detector.calculate_hybrid_score(
        semantic_score=90.0,
        lexical_score=50.0,
        semantic_weight=0.5,
        lexical_weight=0.5,
    )
    # (0.5 * 90) + (0.5 * 50) = 70.0
    assert score == 70.0


def test_calculate_hybrid_score_clamping() -> None:
    """Verify hybrid score clamps to 0.0-100.0 bounds."""
    assert plagiarism_detector.calculate_hybrid_score(150.0, 120.0) == 100.0
    assert plagiarism_detector.calculate_hybrid_score(-20.0, -10.0) == 0.0


def test_classification_categories() -> None:
    """Verify understandable classification categories across score ranges."""
    assert plagiarism_detector.classify_similarity(12.0) == "Very Low Similarity"
    assert plagiarism_detector.classify_similarity(35.0) == "Low Similarity"
    assert plagiarism_detector.classify_similarity(55.0) == "Moderate Similarity"
    assert plagiarism_detector.classify_similarity(75.0) == "High Similarity"
    assert plagiarism_detector.classify_similarity(92.0) == "Very High Similarity"


def test_detect_chunk_matches_exact_and_unrelated() -> None:
    """Verify detection of matching passages and rejection of unrelated text."""
    ref_text = (
        "Distributed consensus protocols allow multiple nodes to agree on a shared state "
        "even in the presence of network partitions and node failures."
    )
    copied_query = (
        "Distributed consensus protocols allow multiple nodes to agree on a shared state "
        "even in the presence of network partitions and node failures."
    )
    unrelated_query = (
        "Tropical rainforests harbor exceptional biodiversity and play a crucial role in global carbon cycling."
    )

    ref_chunks = TextPreprocessor.chunk_document(ref_text)
    ref_embs = semantic_engine.embed_texts([c.text for c in ref_chunks])

    # 1. Copied query should detect match
    copied_chunks = TextPreprocessor.chunk_document(copied_query)
    copied_embs = semantic_engine.embed_texts([c.text for c in copied_chunks])

    matches = plagiarism_detector.detect_chunk_matches(
        query_chunks=copied_chunks,
        ref_chunks=ref_chunks,
        query_embs=copied_embs,
        ref_embs=ref_embs,
        source_name="consensus_paper.txt",
        threshold=50.0,
    )

    assert len(matches) >= 1
    top_match = matches[0]
    assert top_match.source == "consensus_paper.txt"
    assert top_match.similarity_score >= 90.0
    assert top_match.match_type in {"lexical", "hybrid"}
    assert "Distributed consensus" in top_match.submitted_text

    # 2. Unrelated query should yield 0 matches above threshold
    unrelated_chunks = TextPreprocessor.chunk_document(unrelated_query)
    unrelated_embs = semantic_engine.embed_texts([c.text for c in unrelated_chunks])

    unrelated_matches = plagiarism_detector.detect_chunk_matches(
        query_chunks=unrelated_chunks,
        ref_chunks=ref_chunks,
        query_embs=unrelated_embs,
        ref_embs=ref_embs,
        source_name="consensus_paper.txt",
        threshold=50.0,
    )

    assert len(unrelated_matches) == 0
