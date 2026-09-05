"""
Sprint 3 Tests: Vendor Document Upload + Evidence Extraction

All AI calls are mocked — no real Anthropic API key needed.
All 23 Sprint 2 tests must continue passing alongside these.
"""
import io
import pytest
from unittest.mock import patch
from app.document_processing.pdf_processor import PDFExtractionResult
from app.schemas.evidence import ExtractedEvidence, AIEvidenceResponse


# ── Helpers ───────────────────────────────────────────────────────────────────

def _create_project(client, name="Evidence Test Project") -> int:
    r = client.post("/api/v1/projects", json={"name": name})
    assert r.status_code == 201
    return r.json()["id"]


def _upload_doc(client, pid: int, pdf_bytes: bytes, doc_type: str = "vendor") -> int:
    r = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("vendor_doc.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        params={"document_type": doc_type},
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


def _extract_text(client, pid: int, doc_id: int) -> None:
    mock_result = PDFExtractionResult(
        raw_text=(
            "\n\n--- PAGE 1 ---\n\nCompany Profile\n\n"
            "\n\n--- PAGE 7 ---\n\n"
            "The company has provided relevant services since 2018."
        ),
        page_count=7,
        pages=["Company Profile"] + [""] * 5 + ["The company has provided relevant services since 2018."],
    )
    with patch("app.services.document_service.PDFProcessor.extract", return_value=mock_result):
        r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract")
    assert r.status_code == 200


def _setup_vendor_doc_extracted(client, sample_pdf_bytes) -> tuple[int, int]:
    """Full setup: project → vendor upload → text extract. Returns (pid, doc_id)."""
    pid = _create_project(client)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="vendor")
    _extract_text(client, pid, doc_id)
    return pid, doc_id


# ── 1. Vendor Document Upload ─────────────────────────────────────────────────

def test_vendor_document_upload(client, sample_pdf_bytes):
    """Vendor PDF uploads successfully with document_type=vendor."""
    pid = _create_project(client)
    r = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("experience.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
        params={"document_type": "vendor"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["document_type"] == "vendor"
    assert data["project_id"] == pid
    assert data["filename"] == "experience.pdf"
    assert data["extraction_status"] == "pending"


def test_vendor_document_type_stored(client, sample_pdf_bytes):
    """document_type=vendor is persisted correctly."""
    pid = _create_project(client)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="vendor")
    # Can also upload bid type
    doc_id_bid = _upload_doc(client, pid, sample_pdf_bytes, doc_type="bid")
    assert doc_id != doc_id_bid


def test_vendor_upload_rejects_non_pdf(client):
    """Non-PDF files are rejected for vendor documents too."""
    pid = _create_project(client)
    r = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("doc.txt", io.BytesIO(b"plain text"), "text/plain")},
        params={"document_type": "vendor"},
    )
    assert r.status_code == 400
    assert "PDF" in r.json()["detail"]


def test_vendor_upload_rejects_nonexistent_project(client, sample_pdf_bytes):
    """Upload to a non-existent project returns 404."""
    r = client.post(
        "/api/v1/projects/99999/documents",
        files={"file": ("v.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
        params={"document_type": "vendor"},
    )
    assert r.status_code == 404


def test_vendor_document_project_ownership(client, sample_pdf_bytes):
    """Vendor document cannot be accessed via a different project."""
    pid_a = _create_project(client, "Project A")
    pid_b = _create_project(client, "Project B")
    doc_id = _upload_doc(client, pid_a, sample_pdf_bytes, doc_type="vendor")

    # Try to extract text from doc using wrong project
    r = client.post(f"/api/v1/projects/{pid_b}/documents/{doc_id}/extract")
    assert r.status_code == 404


# ── 2. PDF Extraction (vendor docs) ──────────────────────────────────────────

def test_vendor_pdf_text_extraction(client, sample_pdf_bytes):
    """PDF text is extracted from vendor document with page boundaries."""
    pid = _create_project(client)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="vendor")

    mock_result = PDFExtractionResult(
        raw_text="\n\n--- PAGE 1 ---\n\nVendor info here\n\n--- PAGE 2 ---\n\nCertifications",
        page_count=2,
        pages=["Vendor info here", "Certifications"],
    )
    with patch("app.services.document_service.PDFProcessor.extract", return_value=mock_result):
        r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract")

    assert r.status_code == 200
    data = r.json()
    assert data["extraction_status"] == "completed"
    assert data["page_count"] == 2
    assert data["text_length"] > 0


def test_vendor_pdf_page_boundaries_preserved(client, sample_pdf_bytes):
    """Page boundary markers are embedded in extracted text."""
    pid = _create_project(client)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="vendor")

    page1 = "Company: Acme Corp"
    page2 = "Experience: 10 years"
    raw_text = f"\n\n--- PAGE 1 ---\n\n{page1}\n\n--- PAGE 2 ---\n\n{page2}"

    mock_result = PDFExtractionResult(
        raw_text=raw_text,
        page_count=2,
        pages=[page1, page2],
    )
    with patch("app.services.document_service.PDFProcessor.extract", return_value=mock_result):
        r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract")

    assert r.status_code == 200
    # text_length confirms all page content is stored
    assert r.json()["text_length"] == len(raw_text)


# ── 3. Evidence Schema Validation ────────────────────────────────────────────

def test_evidence_schema_valid():
    ev = ExtractedEvidence(
        evidence_text="Company has operated since 2018.",
        evidence_type="experience",
        source_page_number=7,
        confidence=0.94,
    )
    assert ev.evidence_type == "experience"
    assert ev.confidence == 0.94
    assert ev.source_page_number == 7


def test_evidence_schema_invalid_type():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        ExtractedEvidence(
            evidence_text="Some text",
            evidence_type="invented_type",
        )


def test_evidence_schema_no_page_number():
    """source_page_number is optional."""
    ev = ExtractedEvidence(
        evidence_text="Some evidence text.",
        evidence_type="technical",
    )
    assert ev.source_page_number is None


def test_evidence_schema_confidence_bounds():
    from pydantic import ValidationError
    # Valid bounds
    ev = ExtractedEvidence(evidence_text="x", confidence=0.0)
    assert ev.confidence == 0.0
    ev2 = ExtractedEvidence(evidence_text="x", confidence=1.0)
    assert ev2.confidence == 1.0
    # Out of bounds
    with pytest.raises(ValidationError):
        ExtractedEvidence(evidence_text="x", confidence=1.5)


def test_ai_evidence_response_schema_empty():
    parsed = AIEvidenceResponse(evidence=[])
    assert parsed.evidence == []


def test_ai_evidence_response_schema_full():
    data = {
        "evidence": [
            {
                "evidence_text": "Certified ISO 9001 since 2020.",
                "evidence_type": "certification",
                "source_page_number": 3,
                "confidence": 0.97,
            }
        ]
    }
    parsed = AIEvidenceResponse(**data)
    assert len(parsed.evidence) == 1
    assert parsed.evidence[0].evidence_type == "certification"


# ── 4. Evidence Extraction API ───────────────────────────────────────────────

def test_extract_evidence_success(client, sample_pdf_bytes, mock_evidence_provider):
    """Full flow: upload vendor doc → extract text → extract evidence."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)

    r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")
    assert r.status_code == 200
    data = r.json()
    assert data["total_extracted"] == 1
    assert data["model_used"] == "claude-sonnet-4-6"
    assert data["document_id"] == doc_id
    assert data["project_id"] == pid

    ev = data["evidence"][0]
    assert "2018" in ev["evidence_text"]
    assert ev["evidence_type"] == "experience"
    assert ev["source_page_number"] == 7
    assert ev["confidence"] == 0.94


def test_extract_evidence_empty_result(client, sample_pdf_bytes, mock_evidence_provider_empty):
    """AI returning empty evidence list is valid and stores nothing."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)

    r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")
    assert r.status_code == 200
    data = r.json()
    assert data["total_extracted"] == 0
    assert data["evidence"] == []


def test_extract_evidence_requires_vendor_type(client, sample_pdf_bytes, mock_evidence_provider):
    """Evidence extraction must be rejected for non-vendor documents."""
    pid = _create_project(client)
    # Upload as bid (not vendor)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="bid")
    _extract_text(client, pid, doc_id)

    r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")
    assert r.status_code == 400
    assert "vendor" in r.json()["detail"].lower()


def test_extract_evidence_requires_text_extraction(client, sample_pdf_bytes, mock_evidence_provider):
    """Evidence extraction fails if text has not been extracted yet."""
    pid = _create_project(client)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="vendor")
    # Do NOT call /extract

    r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")
    assert r.status_code == 400
    assert "extract" in r.json()["detail"].lower()


def test_extract_evidence_wrong_project(client, sample_pdf_bytes, mock_evidence_provider):
    """Evidence extraction via wrong project returns 404."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)
    other_pid = _create_project(client, "Other Project")

    r = client.post(f"/api/v1/projects/{other_pid}/documents/{doc_id}/extract-evidence")
    assert r.status_code == 404


def test_extract_evidence_malformed_ai_response(
    client, sample_pdf_bytes, mock_evidence_provider_malformed
):
    """Malformed AI JSON returns 422 and no evidence is stored."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)

    r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")
    assert r.status_code == 422
    assert "malformed" in r.json()["detail"].lower()


# ── 5. Get Evidence Endpoints ────────────────────────────────────────────────

def test_get_document_evidence(client, sample_pdf_bytes, mock_evidence_provider):
    """GET /projects/{pid}/documents/{did}/evidence returns stored evidence."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)
    client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")

    r = client.get(f"/api/v1/projects/{pid}/documents/{doc_id}/evidence")
    assert r.status_code == 200
    evidence = r.json()
    assert len(evidence) == 1
    assert evidence[0]["evidence_type"] == "experience"
    assert evidence[0]["source_page_number"] == 7
    assert evidence[0]["confidence"] == 0.94


def test_get_document_evidence_empty(client, sample_pdf_bytes):
    """GET evidence on a new document returns empty list."""
    pid = _create_project(client)
    doc_id = _upload_doc(client, pid, sample_pdf_bytes, doc_type="vendor")

    r = client.get(f"/api/v1/projects/{pid}/documents/{doc_id}/evidence")
    assert r.status_code == 200
    assert r.json() == []


def test_get_project_evidence(client, sample_pdf_bytes, mock_evidence_provider):
    """GET /projects/{pid}/evidence returns all evidence for the project."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)
    client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")

    r = client.get(f"/api/v1/projects/{pid}/evidence")
    assert r.status_code == 200
    evidence = r.json()
    assert len(evidence) >= 1
    assert all(e["project_id"] == pid for e in evidence)


def test_get_project_evidence_nonexistent_project(client):
    """GET evidence for non-existent project returns 404."""
    r = client.get("/api/v1/projects/99999/evidence")
    assert r.status_code == 404


# ── 6. Evidence Persistence ──────────────────────────────────────────────────

def test_evidence_persisted_in_db(client, sample_pdf_bytes, mock_evidence_provider):
    """Evidence is actually stored (GET returns same data as POST response)."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)

    post_r = client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")
    assert post_r.status_code == 200
    posted_ids = {e["id"] for e in post_r.json()["evidence"]}

    get_r = client.get(f"/api/v1/projects/{pid}/documents/{doc_id}/evidence")
    assert get_r.status_code == 200
    fetched_ids = {e["id"] for e in get_r.json()}

    assert posted_ids == fetched_ids


def test_evidence_has_required_fields(client, sample_pdf_bytes, mock_evidence_provider):
    """Every evidence item has the required fields for Sprint 4 matching."""
    pid, doc_id = _setup_vendor_doc_extracted(client, sample_pdf_bytes)
    client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-evidence")

    r = client.get(f"/api/v1/projects/{pid}/documents/{doc_id}/evidence")
    for ev in r.json():
        assert "id" in ev
        assert "project_id" in ev
        assert "source_document_id" in ev
        assert "evidence_text" in ev
        assert "evidence_type" in ev
        assert "source_page_number" in ev
        assert "confidence" in ev
        assert "extracted_by_model" in ev
        assert "created_at" in ev
