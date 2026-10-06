"""Tests for semantic similarity engine and embeddings."""

import numpy as np
from app.services.nlp.semantic import SemanticSimilarityEngine, semantic_engine


def test_embed_texts_shape() -> None:
    """Verify embeddings produce correct dimension (384 for all-MiniLM-L6-v2)."""
    texts = ["First test sentence.", "Second test sentence."]
    embs = semantic_engine.embed_texts(texts)

    assert embs.shape == (2, 384)
    # Verify embeddings are L2 normalized (norm approximately 1.0)
    norm = np.linalg.norm(embs[0])
    assert abs(norm - 1.0) < 0.01


def test_semantic_similarity_paraphrase_vs_unrelated() -> None:
    """Verify paraphrased sentences yield significantly higher similarity than unrelated sentences."""
    sentence_ref = "A canine leaped gracefully over the wooden fence."
    sentence_paraphrase = "The dog jumped smoothly across the backyard barrier."
    sentence_unrelated = "Central bank interest rates influence capital investment."

    embs = semantic_engine.embed_texts([sentence_ref, sentence_paraphrase, sentence_unrelated])

    # Cosine similarity between ref (0) and paraphrase (1)
    sim_paraphrase = float(np.dot(embs[0], embs[1]))
    # Cosine similarity between ref (0) and unrelated (2)
    sim_unrelated = float(np.dot(embs[0], embs[2]))

    assert sim_paraphrase > 0.60
    assert sim_unrelated < 0.30
    assert sim_paraphrase > sim_unrelated + 0.40


def test_cosine_similarity_matrix_empty() -> None:
    """Verify empty embedding matrices return empty result."""
    empty = np.empty((0, 384), dtype=np.float32)
    matrix = semantic_engine.compute_cosine_similarity(empty, empty)
    assert matrix.shape == (0, 0)
