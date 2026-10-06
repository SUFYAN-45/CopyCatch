"""Orchestration service for the complete plagiarism analysis workflow."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np

from app.core.config import settings
from app.schemas.analysis import AnalysisResult, Match
from app.schemas.document import DocumentMetadata
from app.services.document.extractor import DocumentEmptyError, DocumentExtractor
from app.services.nlp.preprocessor import TextChunk, TextPreprocessor
from app.services.nlp.semantic import semantic_engine
from app.services.plagiarism.detector import plagiarism_detector
from app.services.plagiarism.lexical import lexical_engine
from app.services.storage.local_storage import storage_service

logger = logging.getLogger(__name__)


class PlagiarismAnalysisService:
    """Orchestrates document extraction, preprocessing, multi-modal comparison, and reporting."""

    def __init__(self) -> None:
        # In-memory runtime cache for reference documents: filename -> {mtime, text, chunks, embeddings}
        self._ref_cache: Dict[str, Dict[str, Any]] = {}

    def _get_or_load_reference(self, path: Path) -> Optional[Dict[str, Any]]:
        """Load and cache processed representation of a reference corpus document."""
        try:
            mtime = path.stat().st_mtime
            cached = self._ref_cache.get(path.name)

            if cached is not None and cached.get("mtime") == mtime:
                return cached

            # Extract raw text
            text = DocumentExtractor.extract_text(path)
            chunks = TextPreprocessor.chunk_document(text)

            if not chunks:
                return None

            chunk_texts = [c.text for c in chunks]
            embeddings = semantic_engine.embed_texts(chunk_texts)

            cached_data = {
                "mtime": mtime,
                "text": text,
                "chunks": chunks,
                "embeddings": embeddings,
            }
            self._ref_cache[path.name] = cached_data
            return cached_data

        except DocumentEmptyError:
            logger.warning("Reference document '%s' is empty or has no readable text. Skipping.", path.name)
            return None
        except Exception as err:
            logger.warning("Could not process reference document '%s': %s. Skipping.", path.name, err)
            return None

    def invalidate_cache(self, filename: Optional[str] = None) -> None:
        """Clear cache for a specific reference document or all documents."""
        if filename:
            self._ref_cache.pop(filename, None)
        else:
            self._ref_cache.clear()

    def analyze_document(
        self,
        file_path: Path,
        metadata: DocumentMetadata,
        semantic_weight: float = settings.DEFAULT_SEMANTIC_WEIGHT,
        lexical_weight: float = settings.DEFAULT_LEXICAL_WEIGHT,
    ) -> AnalysisResult:
        """Execute full plagiarism detection pipeline on an uploaded document."""
        # 1. Document Extraction
        extracted_text = DocumentExtractor.extract_text(file_path)

        # 2. Text Preprocessing & Chunking
        query_chunks = TextPreprocessor.chunk_document(extracted_text)
        if not query_chunks:
            return plagiarism_detector.generate_report(
                document_metadata=metadata,
                semantic_score=0.0,
                lexical_score=0.0,
                matches=[],
                semantic_weight=semantic_weight,
                lexical_weight=lexical_weight,
                message="Submitted document contains no chunkable text.",
            )

        # 3. Generate Semantic Embeddings for Query Chunks
        query_texts = [c.text for c in query_chunks]
        query_embs = semantic_engine.embed_texts(query_texts)

        # 4. Load Reference Corpus
        ref_files = storage_service.get_reference_documents()

        # Guard: Exclude submitted document from comparing against itself
        valid_refs: List[Path] = []
        resolved_query_path = file_path.resolve()
        for ref_p in ref_files:
            if ref_p.resolve() == resolved_query_path or ref_p.name == metadata.filename:
                continue
            valid_refs.append(ref_p)

        if not valid_refs:
            report = plagiarism_detector.generate_report(
                document_metadata=metadata,
                semantic_score=0.0,
                lexical_score=0.0,
                matches=[],
                semantic_weight=semantic_weight,
                lexical_weight=lexical_weight,
                message="No reference documents available in the corpus for comparison.",
            )
            storage_service.save_report(report)
            return report

        # 5. Compare Query against Reference Corpus
        all_matches: List[Match] = []
        max_lexical_scores: List[float] = []
        chunk_max_semantic_scores: np.ndarray = np.zeros(len(query_chunks), dtype=np.float32)

        for ref_p in valid_refs:
            ref_data = self._get_or_load_reference(ref_p)
            if not ref_data:
                continue

            ref_chunks = ref_data["chunks"]
            ref_embs = ref_data["embeddings"]
            ref_text = ref_data["text"]

            # Document-level TF-IDF similarity against this reference
            doc_tfidf = lexical_engine.compute_tfidf_similarity(extracted_text, ref_text) * 100.0
            max_lexical_scores.append(doc_tfidf)

            # Cosine similarity matrix: Q x R
            sim_matrix = np.dot(query_embs, ref_embs.T)
            # Track peak semantic match for each query chunk across corpus
            chunk_best = np.max(sim_matrix, axis=1)
            chunk_max_semantic_scores = np.maximum(chunk_max_semantic_scores, chunk_best)

            # Detect matching passages
            ref_matches = plagiarism_detector.detect_chunk_matches(
                query_chunks=query_chunks,
                ref_chunks=ref_chunks,
                query_embs=query_embs,
                ref_embs=ref_embs,
                source_name=ref_p.name,
                threshold=settings.MATCH_SIMILARITY_THRESHOLD,
                semantic_weight=semantic_weight,
                lexical_weight=lexical_weight,
            )
            all_matches.extend(ref_matches)

        # 6. Aggregate Overall Document Scores
        # Overall semantic: average of peak chunk similarities across query
        overall_semantic = float(np.mean(chunk_max_semantic_scores)) * 100.0 if len(query_chunks) > 0 else 0.0

        # Overall lexical: highest TF-IDF similarity against any reference in corpus
        overall_lexical = float(max(max_lexical_scores)) if max_lexical_scores else 0.0

        # Deduplicate and sort matches
        final_matches = plagiarism_detector.deduplicate_matches(all_matches)

        # 7. Generate and Persist Analysis Report
        report = plagiarism_detector.generate_report(
            document_metadata=metadata,
            semantic_score=overall_semantic,
            lexical_score=overall_lexical,
            matches=final_matches,
            semantic_weight=semantic_weight,
            lexical_weight=lexical_weight,
        )

        storage_service.save_report(report)
        return report


analysis_service = PlagiarismAnalysisService()
