"""Lightweight local filesystem storage service."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from app.core.config import settings
from app.schemas.analysis import AnalysisResult
from app.schemas.document import DocumentMetadata
from app.utils.file_validation import sanitize_filename


class LocalStorageService:
    """Manages simple filesystem storage for uploads, reference documents, and JSON reports."""

    def __init__(
        self,
        uploads_dir: Optional[Path] = None,
        reference_dir: Optional[Path] = None,
        reports_dir: Optional[Path] = None,
    ) -> None:
        self.uploads_dir = uploads_dir or settings.UPLOADS_DIR
        self.reference_dir = reference_dir or settings.REFERENCE_DOCS_DIR
        self.reports_dir = reports_dir or settings.REPORTS_DIR

    def ensure_directories(self) -> None:
        """Ensure all required local storage directories exist."""
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.reference_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)

    def save_upload(self, filename: str, content: bytes) -> Tuple[Path, DocumentMetadata]:
        """Save an uploaded file safely to backend/data/uploads/ and return its metadata."""
        self.ensure_directories()
        safe_name = sanitize_filename(filename)
        # Prefix with unique token to avoid collisions while keeping original name recognizable
        stored_filename = f"{uuid4().hex[:8]}_{safe_name}"
        destination = self.uploads_dir / stored_filename

        destination.write_bytes(content)

        metadata = DocumentMetadata(
            filename=safe_name,
            file_type=destination.suffix.lower(),
            size=len(content),
        )
        return destination, metadata

    def save_reference_document(self, filename: str, content: bytes) -> Tuple[Path, DocumentMetadata]:
        """Save a reference corpus document safely to backend/data/reference_documents/."""
        self.ensure_directories()
        safe_name = sanitize_filename(filename)
        destination = self.reference_dir / safe_name
        destination.write_bytes(content)

        metadata = DocumentMetadata(
            filename=safe_name,
            file_type=destination.suffix.lower(),
            size=len(content),
        )
        return destination, metadata

    def save_report(self, report: AnalysisResult) -> Path:
        """Persist an analysis report as analysis_<analysis_id>.json in backend/data/reports/."""
        self.ensure_directories()
        report_path = self.reports_dir / f"analysis_{report.analysis_id}.json"
        report_data = report.model_dump(mode="json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        return report_path

    def get_report(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a stored analysis report by analysis_id."""
        report_path = self.reports_dir / f"analysis_{analysis_id}.json"
        if not report_path.is_file():
            return None
        with open(report_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def list_reports(self) -> List[str]:
        """List all analysis report IDs currently stored in backend/data/reports/."""
        self.ensure_directories()
        report_ids: List[str] = []
        for file in self.reports_dir.glob("analysis_*.json"):
            # Extract id from analysis_<id>.json
            name = file.stem
            if name.startswith("analysis_"):
                report_ids.append(name.replace("analysis_", "", 1))
        return sorted(report_ids)


storage_service = LocalStorageService()
