"""Analysis API routes for plagiarism detection."""

import logging
from typing import Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.core.config import settings
from app.schemas.analysis import AnalysisResult
from app.services.document.extractor import DocumentEmptyError, DocumentExtractionError
from app.services.plagiarism.service import analysis_service
from app.services.storage.local_storage import storage_service
from app.utils.file_validation import validate_uploaded_file

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analysis"])


@router.post(
    "/analyze",
    response_model=AnalysisResult,
    summary="Upload and analyze a document for plagiarism against reference corpus",
)
async def analyze_document_endpoint(
    file: UploadFile = File(..., description="Document file to analyze (.txt, .pdf, .docx)"),
    semantic_weight: Optional[float] = Query(
        default=None, ge=0.0, le=1.0, description="Optional custom semantic similarity weight"
    ),
    lexical_weight: Optional[float] = Query(
        default=None, ge=0.0, le=1.0, description="Optional custom lexical similarity weight"
    ),
) -> AnalysisResult:
    """Validate, extract, preprocess, and compare an uploaded document against reference corpus."""
    filename = file.filename or "unnamed_document.txt"

    # Read uploaded content
    try:
        content = await file.read()
    except Exception as err:
        logger.error("Failed to read uploaded file '%s': %s", filename, err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read uploaded file payload.",
        ) from err

    # Validate file
    is_valid, validation_error = validate_uploaded_file(
        filename=filename,
        content=content,
        content_type=file.content_type,
        max_size_bytes=settings.MAX_UPLOAD_SIZE_BYTES,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=validation_error or "Invalid uploaded file.",
        )

    # Save to uploads directory
    try:
        saved_path, metadata = storage_service.save_upload(filename, content)
    except Exception as err:
        logger.error("Failed to save uploaded file '%s': %s", filename, err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store uploaded document on local disk.",
        ) from err

    # Execute analysis pipeline
    sem_w = semantic_weight if semantic_weight is not None else settings.DEFAULT_SEMANTIC_WEIGHT
    lex_w = lexical_weight if lexical_weight is not None else settings.DEFAULT_LEXICAL_WEIGHT

    try:
        report = analysis_service.analyze_document(
            file_path=saved_path,
            metadata=metadata,
            semantic_weight=sem_w,
            lexical_weight=lex_w,
        )
        return report

    except DocumentEmptyError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        ) from err
    except DocumentExtractionError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err),
        ) from err
    except Exception as err:
        logger.error("Analysis pipeline error for '%s': %s", filename, err, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while analyzing the document.",
        ) from err


@router.get(
    "/analysis/{analysis_id}",
    summary="Retrieve a stored analysis report by ID",
)
async def get_analysis_report(analysis_id: str) -> dict:
    """Retrieve an existing analysis report from backend/data/reports/."""
    report = storage_service.get_report(analysis_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis report '{analysis_id}' not found.",
        )
    return report
