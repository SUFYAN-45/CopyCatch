"""Plagiarism detection service package."""

from app.services.plagiarism.detector import PlagiarismDetector, plagiarism_detector
from app.services.plagiarism.lexical import LexicalSimilarityEngine, lexical_engine
from app.services.plagiarism.service import PlagiarismAnalysisService, analysis_service

__all__ = [
    "LexicalSimilarityEngine",
    "PlagiarismAnalysisService",
    "PlagiarismDetector",
    "analysis_service",
    "lexical_engine",
    "plagiarism_detector",
]
