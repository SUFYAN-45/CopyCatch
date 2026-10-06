"""Integration tests for CopyCatch FastAPI endpoints."""

from fastapi.testclient import TestClient
from app.core.config import settings
from app.main import app
from app.services.storage.local_storage import storage_service

client = TestClient(app)


def test_reference_lifecycle_and_analysis_flow() -> None:
    """Test full cycle: add reference, list references, analyze document, get report, delete reference."""
    ref_filename = "ai_ethics_reference.txt"
    ref_content = (
        b"Algorithmic bias occurs when computer systems reflect human prejudices and institutional discrimination. "
        b"Ethical frameworks in artificial intelligence emphasize transparency, fairness, and accountability."
    )

    # 1. Add reference document
    post_ref_resp = client.post(
        f"{settings.API_V1_PREFIX}/references",
        files={"file": (ref_filename, ref_content, "text/plain")},
    )
    assert post_ref_resp.status_code == 201
    ref_data = post_ref_resp.json()
    assert "added successfully" in ref_data["message"]

    try:
        # 2. List references
        list_resp = client.get(f"{settings.API_V1_PREFIX}/references")
        assert list_resp.status_code == 200
        refs = list_resp.json()
        assert any(r["filename"] == ref_filename for r in refs)

        # 3. Analyze a matching document (direct copy)
        query_filename = "student_essay.txt"
        query_content = (
            b"Algorithmic bias occurs when computer systems reflect human prejudices and institutional discrimination. "
            b"Ethical frameworks in artificial intelligence emphasize transparency, fairness, and accountability."
        )

        analyze_resp = client.post(
            f"{settings.API_V1_PREFIX}/analyze",
            files={"file": (query_filename, query_content, "text/plain")},
        )
        assert analyze_resp.status_code == 200
        result = analyze_resp.json()

        assert "analysis_id" in result
        assert result["overall_similarity"] >= 80.0
        assert result["classification"] in {"High Similarity", "Very High Similarity"}
        assert len(result["matches"]) >= 1
        assert result["matches"][0]["source"] == ref_filename

        analysis_id = result["analysis_id"]

        # 4. Retrieve saved analysis report
        get_report_resp = client.get(f"{settings.API_V1_PREFIX}/analysis/{analysis_id}")
        assert get_report_resp.status_code == 200
        saved_report = get_report_resp.json()
        assert saved_report["analysis_id"] == analysis_id
        assert saved_report["overall_similarity"] == result["overall_similarity"]

        # 5. Analyze unrelated document
        unrelated_content = b"The solar system consists of eight planets orbiting the Sun in elliptical paths."
        unrelated_resp = client.post(
            f"{settings.API_V1_PREFIX}/analyze",
            files={"file": ("astronomy.txt", unrelated_content, "text/plain")},
        )
        assert unrelated_resp.status_code == 200
        unrelated_result = unrelated_resp.json()
        assert unrelated_result["overall_similarity"] < 40.0
        assert unrelated_result["classification"] in {"Very Low Similarity", "Low Similarity"}

    finally:
        # 6. Delete reference document
        del_resp = client.delete(f"{settings.API_V1_PREFIX}/references/{ref_filename}")
        assert del_resp.status_code == 200


def test_get_nonexistent_analysis_returns_404() -> None:
    """Verify requesting an unknown analysis ID returns 404."""
    resp = client.get(f"{settings.API_V1_PREFIX}/analysis/non_existent_id_999")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


def test_delete_nonexistent_reference_returns_404() -> None:
    """Verify deleting a nonexistent reference returns 404."""
    resp = client.delete(f"{settings.API_V1_PREFIX}/references/missing_file.txt")
    assert resp.status_code == 404


def test_analyze_empty_file_returns_400() -> None:
    """Verify uploading an empty file to /analyze returns HTTP 400."""
    resp = client.post(
        f"{settings.API_V1_PREFIX}/analyze",
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


def test_analyze_unsupported_extension_returns_400() -> None:
    """Verify uploading an unsupported file format returns HTTP 400."""
    resp = client.post(
        f"{settings.API_V1_PREFIX}/analyze",
        files={"file": ("malware.exe", b"binary content", "application/octet-stream")},
    )
    assert resp.status_code == 400
    assert "unsupported file extension" in resp.json()["detail"].lower()
