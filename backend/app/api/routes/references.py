"""Reference documents management API routes."""

import logging
from typing import List
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.schemas.analysis import ReferenceDocumentInfo
from app.services.document.extractor import DocumentExtractionError, DocumentExtractor
from app.services.plagiarism.service import analysis_service
from app.services.storage.local_storage import storage_service
from app.utils.file_validation import validate_uploaded_file

logger = logging.getLogger(__name__)
router = APIRouter(tags=["References"])


@router.post(
    "/references",
    summary="Upload a reference document to the local corpus",
    status_code=status.HTTP_201_CREATED,
)
async def upload_reference_document(
    file: UploadFile = File(..., description="Reference document file (.txt, .pdf, .docx)"),
) -> dict:
    """Validate, save, and verify readability of a reference corpus document."""
    filename = file.filename or "reference_document.txt"

    try:
        content = await file.read()
    except Exception as err:
        logger.error("Failed to read reference payload '%s': %s", filename, err)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to read reference document payload.",
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
            detail=validation_error or "Invalid reference file.",
        )

    # Save to reference documents directory
    try:
        saved_path, metadata = storage_service.save_reference_document(filename, content)
    except Exception as err:
        logger.error("Failed to save reference file '%s': %s", filename, err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store reference document on disk.",
        ) from err

    # Verify that the saved document is readable and extractable
    try:
        DocumentExtractor.extract_text(saved_path)
    except DocumentExtractionError as err:
        # Clean up unreadable file from disk
        saved_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Uploaded reference document is unreadable: {err}",
        ) from err
    except Exception as err:
        saved_path.unlink(missing_ok=True)
        logger.error("Unexpected error extracting reference '%s': %s", filename, err)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify readability of uploaded reference document.",
        ) from err

    # Invalidate cache for this document
    analysis_service.invalidate_cache(metadata.filename)

    return {
        "message": f"Reference document '{metadata.filename}' added successfully.",
        "filename": metadata.filename,
        "size": metadata.size,
    }


@router.get(
    "/references",
    response_model=List[ReferenceDocumentInfo],
    summary="List all available reference documents in the corpus",
)
async def list_reference_documents() -> List[ReferenceDocumentInfo]:
    """Retrieve list of all reference documents currently stored."""
    return storage_service.list_reference_documents()


@router.delete(
    "/references/{filename}",
    summary="Delete a reference document from the corpus",
)
async def delete_reference_document(filename: str) -> dict:
    """Delete the specified reference document from the local corpus."""
    deleted = storage_service.delete_reference_document(filename)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reference document '{filename}' not found.",
        )

    # Invalidate cache
    analysis_service.invalidate_cache(filename)

    return {"message": f"Reference document '{filename}' deleted successfully."}
