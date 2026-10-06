"""Plagiarism detection service boundary.

Defines the contract and calculation boundaries for:
- Lexical similarity calculation
- Semantic similarity calculation
- Hybrid plagiarism scoring
- Analysis report generation
"""

from typing import List, Optional
from app.schemas.analysis import AnalysisResult, Match


class PlagiarismDetector:
    """Service boundary for similarity computation and hybrid scoring."""

    @staticmethod
    def calculate_lexical_similarity(tokens_a: List[str], tokens_b: List[str]) -> float:
        """Calculate Jaccard token overlap similarity between two token sets.

        Serves as a lightweight lexical similarity boundary before TF-IDF / N-gram
        models are added in the NLP engine phase.
        """
        set_a = set(tokens_a)
        set_b = set(tokens_b)
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return round(intersection / union, 4) if union > 0 else 0.0

    @staticmethod
    def calculate_hybrid_score(
        semantic_score: float,
        lexical_score: float,
        semantic_weight: float = 0.6,
    ) -> float:
        """Combine semantic and lexical similarity scores using weighted interpolation."""
        clamped_semantic = max(0.0, min(1.0, semantic_score))
        clamped_lexical = max(0.0, min(1.0, lexical_score))
        clamped_weight = max(0.0, min(1.0, semantic_weight))

        score = (clamped_weight * clamped_semantic) + ((1.0 - clamped_weight) * clamped_lexical)
        return round(score, 4)

    @classmethod
    def generate_report(
        cls,
        document_id: str,
        semantic_score: float,
        lexical_score: float,
        matches: Optional[List[Match]] = None,
        semantic_weight: float = 0.6,
    ) -> AnalysisResult:
        """Construct a validated AnalysisResult instance from detection scores and matches."""
        overall = cls.calculate_hybrid_score(
            semantic_score=semantic_score,
            lexical_score=lexical_score,
            semantic_weight=semantic_weight,
        )
        return AnalysisResult(
            document_id=document_id,
            overall_similarity=overall,
            semantic_similarity=round(semantic_score, 4),
            lexical_similarity=round(lexical_score, 4),
            matches=matches or [],
        )


plagiarism_detector = PlagiarismDetector()
