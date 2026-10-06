"""Plagiarism detection service package."""

from app.services.plagiarism.detector import PlagiarismDetector, plagiarism_detector

__all__ = ["PlagiarismDetector", "plagiarism_detector"]
