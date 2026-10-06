"""Semantic similarity engine using Sentence Transformers."""

import logging
from typing import List, Optional, Tuple
import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger(__name__)


class SemanticSimilarityEngine:
    """Manages model lifecycle, embeddings generation, and dense cosine similarity matching."""

    _model: Optional[SentenceTransformer] = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        """Load and cache the SentenceTransformer model singleton."""
        if cls._model is None:
            logger.info("Loading SentenceTransformer model: %s", settings.MODEL_NAME)
            cls._model = SentenceTransformer(settings.MODEL_NAME)
            logger.info("SentenceTransformer model successfully loaded.")
        return cls._model

    @classmethod
    def set_model(cls, model: SentenceTransformer) -> None:
        """Allow injecting a mock/custom model for testing."""
        cls._model = model

    @classmethod
    def embed_texts(cls, texts: List[str]) -> np.ndarray:
        """Generate normalized dense embeddings for a list of texts."""
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        model = cls.get_model()
        embeddings = model.encode(
            texts,
            batch_size=32,
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return embeddings

    @classmethod
    def compute_cosine_similarity(
        cls, query_embeddings: np.ndarray, ref_embeddings: np.ndarray
    ) -> np.ndarray:
        """Compute cosine similarity matrix between query and reference embedding matrices."""
        if query_embeddings.size == 0 or ref_embeddings.size == 0:
            return np.empty((0, 0), dtype=np.float32)

        # Dot product of normalized vectors equals cosine similarity
        sim_matrix = np.dot(query_embeddings, ref_embeddings.T)
        return np.clip(sim_matrix, 0.0, 1.0)


semantic_engine = SemanticSimilarityEngine()
