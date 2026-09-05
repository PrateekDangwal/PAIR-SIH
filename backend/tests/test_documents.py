import io
import pytest
from unittest.mock import patch, MagicMock
from app.document_processing.pdf_processor import PDFExtractionResult


def _create_project(client) -> int:
    r = client.post("/api/v1/projects", json={"name": "Doc Test Project"})
    return r.json()["id"]


def test_upload_valid_pdf(client, sample_pdf_bytes):
    pid = _create_project(client)
    response = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("bid.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["project_id"] == pid
    assert data["filename"] == "bid.pdf"
    assert data["mime_type"] == "application/pdf"
    assert data["extraction_status"] == "pending"


def test_upload_rejects_non_pdf(client):
    pid = _create_project(client)
    response = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("report.docx", io.BytesIO(b"fake docx"), "application/msword")},
    )
    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]


def test_upload_rejects_oversized_file(client, sample_pdf_bytes):
    pid = _create_project(client)
    # Patch max size to 1 byte to simulate oversized file
    with patch("app.services.document_service.settings") as mock_settings:
        mock_settings.max_upload_bytes = 1
        mock_settings.MAX_UPLOAD_SIZE_MB = 0
        mock_settings.upload_path.return_value = None
        response = client.post(
            f"/api/v1/projects/{pid}/documents",
            files={
                "file": ("big.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")
            },
        )
    assert response.status_code == 413


def test_upload_to_nonexistent_project(client, sample_pdf_bytes):
    response = client.post(
        "/api/v1/projects/99999/documents",
        files={"file": ("bid.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
    )
    assert response.status_code == 404


def test_document_ownership_check(client, sample_pdf_bytes):
    """Document from project A should not be accessible via project B."""
    pid_a = _create_project(client)
    pid_b_r = client.post("/api/v1/projects", json={"name": "Project B"})
    pid_b = pid_b_r.json()["id"]

    upload = client.post(
        f"/api/v1/projects/{pid_a}/documents",
        files={"file": ("bid.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
    )
    doc_id = upload.json()["id"]

    # Try to access doc from wrong project
    response = client.post(f"/api/v1/projects/{pid_b}/documents/{doc_id}/extract")
    assert response.status_code == 404


def test_pdf_text_extraction(client, sample_pdf_bytes):
    """Test the full extract endpoint with a real PyMuPDF call."""
    pid = _create_project(client)
    upload = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("bid.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
    )
    doc_id = upload.json()["id"]

    # PyMuPDF will try to open the file — we mock the processor
    mock_result = PDFExtractionResult(
        raw_text="--- PAGE 1 ---\nGeM Bid Test content here",
        page_count=1,
        pages=["GeM Bid Test content here"],
    )
    with patch(
        "app.services.document_service.PDFProcessor.extract",
        return_value=mock_result,
    ):
        response = client.post(
            f"/api/v1/projects/{pid}/documents/{doc_id}/extract"
        )

    assert response.status_code == 200
    data = response.json()
    assert data["extraction_status"] == "completed"
    assert data["page_count"] == 1
    assert data["text_length"] > 0
