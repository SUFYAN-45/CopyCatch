"""Plagiarism detection and hybrid scoring engine."""

from typing import Any, Dict, List, Optional
import numpy as np

from app.core.config import settings
from app.schemas.analysis import AnalysisResult, Match
from app.schemas.document import DocumentMetadata
from app.services.nlp.preprocessor import TextChunk
from app.services.plagiarism.lexical import lexical_engine


class PlagiarismDetector:
    """Combines lexical and semantic signals into calibrated hybrid similarity reports."""

    @staticmethod
    def calculate_hybrid_score(
        semantic_score: float,
        lexical_score: float,
        semantic_weight: float = settings.DEFAULT_SEMANTIC_WEIGHT,
        lexical_weight: float = settings.DEFAULT_LEXICAL_WEIGHT,
    ) -> float:
        """Combine semantic and lexical similarity scores into a clamped 0-100 percentage.

        Accepts either 0.0-1.0 fractions or 0.0-100.0 percentages.
        """
        # Normalize to 0-100 if passed as 0-1
        s_score = semantic_score * 100.0 if semantic_score <= 1.0 else semantic_score
        l_score = lexical_score * 100.0 if lexical_score <= 1.0 else lexical_score

        s_score = max(0.0, min(100.0, s_score))
        l_score = max(0.0, min(100.0, l_score))

        # Normalize weights so they sum to 1.0
        total_w = semantic_weight + lexical_weight
        if total_w <= 0:
            w_sem, w_lex = 0.6, 0.4
        else:
            w_sem = semantic_weight / total_w
            w_lex = lexical_weight / total_w

        hybrid = (w_sem * s_score) + (w_lex * l_score)
        return round(float(np.clip(hybrid, 0.0, 100.0)), 1)

    @staticmethod
    def classify_similarity(score: float) -> str:
        """Categorize similarity score into an understandable, objective description."""
        return settings.classify_similarity(score)

    @classmethod
    def detect_chunk_matches(
        cls,
        query_chunks: List[TextChunk],
        ref_chunks: List[TextChunk],
        query_embs: np.ndarray,
        ref_embs: np.ndarray,
        source_name: str,
        threshold: float = settings.MATCH_SIMILARITY_THRESHOLD,
        semantic_weight: float = settings.DEFAULT_SEMANTIC_WEIGHT,
        lexical_weight: float = settings.DEFAULT_LEXICAL_WEIGHT,
    ) -> List[Match]:
        """Detect and return meaningful matching passages between query and a reference document."""
        if not query_chunks or not ref_chunks:
            return []

        if query_embs.size == 0 or ref_embs.size == 0:
            return []

        # Cosine similarity matrix: Q x R
        sim_matrix = np.dot(query_embs, ref_embs.T)
        matches: List[Match] = []

        for q_idx, q_chunk in enumerate(query_chunks):
            # Find the best matching reference chunk
            r_idx = int(np.argmax(sim_matrix[q_idx]))
            sem_sim_val = float(sim_matrix[q_idx, r_idx]) * 100.0  # 0-100 scale

            r_chunk = ref_chunks[r_idx]

            # Calculate localized lexical similarity for this pair
            lex_sim_fraction = lexical_engine.compute_chunk_lexical_similarity(
                q_chunk.lexical_text, r_chunk.lexical_text
            )
            lex_sim_val = lex_sim_fraction * 100.0

            # Compute chunk-level hybrid score
            pair_hybrid_score = cls.calculate_hybrid_score(
                semantic_score=sem_sim_val,
                lexical_score=lex_sim_val,
                semantic_weight=semantic_weight,
                lexical_weight=lexical_weight,
            )

            if pair_hybrid_score >= threshold:
                # Determine match characterization
                if lex_sim_fraction >= 0.65:
                    match_type = "lexical"
                elif sem_sim_val >= 70.0 and lex_sim_fraction < 0.35:
                    match_type = "semantic"
                else:
                    match_type = "hybrid"

                location_data = {
                    "submitted_chunk_index": q_chunk.chunk_index,
                    "submitted_start_char": q_chunk.start_char,
                    "submitted_end_char": q_chunk.end_char,
                    "reference_chunk_index": r_chunk.chunk_index,
                }

                matches.append(
                    Match(
                        source=source_name,
                        submitted_text=q_chunk.text,
                        matched_text=r_chunk.text,
                        similarity_score=pair_hybrid_score,
                        match_type=match_type,
                        location=location_data,
                    )
                )

        return cls.deduplicate_matches(matches)

    @staticmethod
    def deduplicate_matches(matches: List[Match]) -> List[Match]:
        """Deduplicate overlapping and redundant matches, preserving highest scoring passages."""
        if not matches:
            return []

        # Group by submitted text snippet to remove exact duplicates
        unique_matches: Dict[str, Match] = {}
        for m in matches:
            key = (m.source, m.submitted_text.strip())
            if key not in unique_matches or m.similarity_score > unique_matches[key].similarity_score:
                unique_matches[key] = m

        sorted_matches = sorted(
            unique_matches.values(), key=lambda x: x.similarity_score, reverse=True
        )

        return sorted_matches[: settings.TOP_K_MATCHES]

    @classmethod
    def generate_report(
        cls,
        document_metadata: Optional[DocumentMetadata],
        semantic_score: float,
        lexical_score: float,
        matches: List[Match],
        semantic_weight: float = settings.DEFAULT_SEMANTIC_WEIGHT,
        lexical_weight: float = settings.DEFAULT_LEXICAL_WEIGHT,
        message: Optional[str] = None,
    ) -> AnalysisResult:
        """Construct a validated AnalysisResult instance with normalized scores and category."""
        overall_score = cls.calculate_hybrid_score(
            semantic_score=semantic_score,
            lexical_score=lexical_score,
            semantic_weight=semantic_weight,
            lexical_weight=lexical_weight,
        )

        classification = cls.classify_similarity(overall_score)
        doc_id = document_metadata.document_id if document_metadata else None

        return AnalysisResult(
            document_id=doc_id,
            document=document_metadata,
            overall_similarity=overall_score,
            semantic_similarity=round(max(0.0, min(100.0, semantic_score)), 1),
            lexical_similarity=round(max(0.0, min(100.0, lexical_score)), 1),
            classification=classification,
            matches=matches,
            message=message,
        )


plagiarism_detector = PlagiarismDetector()
