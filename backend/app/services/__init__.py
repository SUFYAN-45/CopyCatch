"""Services package for CopyCatch."""

from app.services.document import (
    DocumentEmptyError,
    DocumentExtractionError,
    DocumentExtractor,
    UnsupportedFormatError,
    document_extractor,
)
from app.services.nlp import (
    SemanticSimilarityEngine,
    TextChunk,
    TextPreprocessor,
    semantic_engine,
    text_preprocessor,
)
from app.services.plagiarism import (
    LexicalSimilarityEngine,
    PlagiarismAnalysisService,
    PlagiarismDetector,
    analysis_service,
    lexical_engine,
    plagiarism_detector,
)
from app.services.storage import LocalStorageService, storage_service

__all__ = [
    "DocumentEmptyError",
    "DocumentExtractionError",
    "DocumentExtractor",
    "LexicalSimilarityEngine",
    "LocalStorageService",
    "PlagiarismAnalysisService",
    "PlagiarismDetector",
    "SemanticSimilarityEngine",
    "TextChunk",
    "TextPreprocessor",
    "UnsupportedFormatError",
    "analysis_service",
    "document_extractor",
    "lexical_engine",
    "plagiarism_detector",
    "semantic_engine",
    "storage_service",
    "text_preprocessor",
]
