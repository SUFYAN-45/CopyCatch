"""Services package for CopyCatch."""

from app.services.document import DocumentExtractor, document_extractor
from app.services.nlp import TextPreprocessor, text_preprocessor
from app.services.plagiarism import PlagiarismDetector, plagiarism_detector
from app.services.storage import LocalStorageService, storage_service

__all__ = [
    "DocumentExtractor",
    "document_extractor",
    "LocalStorageService",
    "PlagiarismDetector",
    "plagiarism_detector",
    "storage_service",
    "TextPreprocessor",
    "text_preprocessor",
]
