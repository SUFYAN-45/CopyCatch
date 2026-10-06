"""File validation and filename sanitization utilities."""

import os
import re
from pathlib import Path
from typing import Optional, Set, Tuple

# Supported file extensions (lowercase)
SUPPORTED_EXTENSIONS: Set[str] = {".txt", ".pdf", ".docx"}

# Recognized MIME / Content-Type mappings for supported extensions
ALLOWED_MIME_TYPES = {
    ".txt": {
        "text/plain",
        "text/plain; charset=utf-8",
        "text/plain; charset=us-ascii",
        "application/octet-stream",
    },
    ".pdf": {
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream",
    },
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/zip",
        "application/x-zip-compressed",
        "application/octet-stream",
    },
}

# Windows reserved device names that cannot be used as filenames
WINDOWS_RESERVED_NAMES = {
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
}


def sanitize_filename(filename: str) -> str:
    """Sanitize user-provided filename to prevent directory traversal and injection.

    - Removes path separators and directory navigation (e.g., ../ or \\).
    - Strips leading and trailing dots and whitespace.
    - Replaces unsafe characters with underscores.
    - Prevents Windows reserved device names.
    - Truncates long filenames safely preserving extension.
    - Provides a safe fallback name if sanitization produces an empty string.
    """
    if not filename or not filename.strip():
        return "unnamed_document.txt"

    # Strip directory components (handle both Windows and POSIX path separators)
    cleaned = os.path.basename(filename.replace("\\", "/")).strip()
    if not cleaned:
        return "unnamed_document.txt"

    # Remove null bytes and non-printable characters
    cleaned = re.sub(r"[\x00-\x1f\x7f]", "", cleaned)

    # Separate base name and extension
    name_part, ext = os.path.splitext(cleaned)
    ext = ext.lower()

    # Normalize name_part: keep alphanumeric, hyphens, and underscores; replace others with _
    safe_name = re.sub(r"[^\w\-.]", "_", name_part).strip(" ._-")
    safe_name = re.sub(r"_+", "_", safe_name)

    # Guard against Windows reserved names
    if safe_name.upper() in WINDOWS_RESERVED_NAMES:
        safe_name = f"safe_{safe_name}"

    if not safe_name:
        safe_name = "unnamed_document"

    if not ext:
        ext = ".txt"

    # Limit filename length (max 200 chars for base name)
    safe_name = safe_name[:200]

    return f"{safe_name}{ext}"


def is_supported_extension(filename: str) -> bool:
    """Check if the filename has an allowed extension."""
    ext = Path(filename).suffix.lower()
    return ext in SUPPORTED_EXTENSIONS


def validate_file_content(content: bytes, ext: str) -> Tuple[bool, Optional[str]]:
    """Validate binary content consistency for a given extension."""
    if ext == ".pdf":
        if not content.startswith(b"%PDF-"):
            return False, "File content does not match standard PDF header signature (%PDF-)."
    elif ext == ".docx":
        # DOCX is a zipped OpenXML archive starting with standard PK zip signature
        if not (content.startswith(b"PK\x03\x04") or content.startswith(b"PK\x05\x06")):
            return False, "File content does not match standard DOCX zip container signature."
    elif ext == ".txt":
        # Check that file does not contain null bytes indicating executable/binary
        if b"\x00" in content:
            return False, "Text file appears to contain binary content or null bytes."
    return True, None


def validate_uploaded_file(
    filename: str,
    content: bytes,
    content_type: Optional[str] = None,
    max_size_bytes: int = 15 * 1024 * 1024,
) -> Tuple[bool, Optional[str]]:
    """Validate an uploaded document against extension, size, MIME type, and binary header.

    Returns:
        (is_valid, error_message): Tuple where is_valid is True if valid, False otherwise.
    """
    if not filename or not filename.strip():
        return False, "Filename cannot be empty."

    # Validate size
    if len(content) == 0:
        return False, "Uploaded file is empty (0 bytes)."

    if len(content) > max_size_bytes:
        max_mb = max_size_bytes / (1024 * 1024)
        return False, f"File size exceeds maximum allowed limit of {max_mb:.1f} MB."

    # Validate extension
    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        allowed = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        return False, f"Unsupported file extension '{ext}'. Supported extensions are: {allowed}."

    # Validate MIME type if provided
    if content_type:
        normalized_mime = content_type.lower().split(";")[0].strip()
        allowed_mimes = ALLOWED_MIME_TYPES.get(ext, set())
        # Check against allowed base types
        matched = any(normalized_mime == m.split(";")[0].strip() for m in allowed_mimes)
        if not matched:
            return False, f"Content-Type '{content_type}' is not valid for {ext} files."

    # Validate content signature
    valid_sig, sig_error = validate_file_content(content, ext)
    if not valid_sig:
        return False, sig_error

    return True, None
