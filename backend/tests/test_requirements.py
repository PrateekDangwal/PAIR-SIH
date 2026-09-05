import io
import pytest
import json
from unittest.mock import patch, MagicMock
from app.schemas.requirement import AIExtractionResponse, ExtractedRequirement
from app.document_processing.pdf_processor import PDFExtractionResult


def _setup_project_with_extracted_doc(client, sample_pdf_bytes):
    """Helper: create project → upload doc → mock extract text → return ids."""
    # Create project
    proj = client.post("/api/v1/projects", json={"name": "Req Test"})
    pid = proj.json()["id"]

    # Upload document
    upload = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("bid.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
    )
    doc_id = upload.json()["id"]

    # Extract text
    mock_result = PDFExtractionResult(
        raw_text="--- PAGE 1 ---\nAll vendors must register on GeM portal.",
        page_count=1,
        pages=["All vendors must register on GeM portal."],
    )
    with patch(
        "app.services.document_service.PDFProcessor.extract",
        return_value=mock_result,
    ):
        client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract")

    return pid, doc_id


# ── Pydantic schema tests ─────────────────────────────────────────────────────

def test_requirement_schema_valid():
    req = ExtractedRequirement(
        title="Vendor Registration",
        requirement_text="Vendors must register on GeM.",
        category="eligibility",
        is_mandatory=True,
        priority=5,
        severity="high",
        source_page_number=1,
        confidence=0.95,
    )
    assert req.category == "eligibility"
    assert req.priority == 5


def test_requirement_schema_invalid_category():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        ExtractedRequirement(
            title="Test",
            requirement_text="Test req",
            category="invented_category",  # not in Literal
        )


def test_requirement_schema_priority_clamp():
    req = ExtractedRequirement(
        title="Test",
        requirement_text="Test",
        priority=10,  # out of range — should clamp to 5
    )
    assert req.priority == 5


def test_ai_extraction_response_schema():
    data = {
        "requirements": [
            {
                "title": "Registration",
                "requirement_text": "Must be registered.",
                "category": "eligibility",
                "is_mandatory": True,
                "priority": 4,
                "severity": "high",
                "source_page_number": 2,
                "confidence": 0.9,
            }
        ]
    }
    parsed = AIExtractionResponse(**data)
    assert len(parsed.requirements) == 1
    assert parsed.requirements[0].title == "Registration"


def test_ai_extraction_response_empty_requirements():
    parsed = AIExtractionResponse(requirements=[])
    assert parsed.requirements == []


# ── API integration tests (mocked AI) ────────────────────────────────────────

def test_extract_requirements_success(client, sample_pdf_bytes, mock_anthropic_provider):
    pid, doc_id = _setup_project_with_extracted_doc(client, sample_pdf_bytes)

    response = client.post(
        f"/api/v1/projects/{pid}/documents/{doc_id}/extract-requirements"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_extracted"] == 1
    assert data["model_used"] == "claude-sonnet-4-6"
    req = data["requirements"][0]
    assert req["title"] == "Vendor Registration"
    assert req["category"] == "eligibility"
    assert req["is_mandatory"] is True


def test_extract_requirements_wrong_project(client, sample_pdf_bytes, mock_anthropic_provider):
    pid, doc_id = _setup_project_with_extracted_doc(client, sample_pdf_bytes)
    other_proj = client.post("/api/v1/projects", json={"name": "Other"}).json()["id"]

    response = client.post(
        f"/api/v1/projects/{other_proj}/documents/{doc_id}/extract-requirements"
    )
    assert response.status_code == 404


def test_extract_requirements_text_not_extracted(client, sample_pdf_bytes, mock_anthropic_provider):
    """Should return 400 if extract endpoint hasn't been called yet."""
    proj = client.post("/api/v1/projects", json={"name": "No Extraction"})
    pid = proj.json()["id"]

    upload = client.post(
        f"/api/v1/projects/{pid}/documents",
        files={"file": ("bid.pdf", io.BytesIO(sample_pdf_bytes), "application/pdf")},
    )
    doc_id = upload.json()["id"]

    response = client.post(
        f"/api/v1/projects/{pid}/documents/{doc_id}/extract-requirements"
    )
    assert response.status_code == 400


def test_list_requirements(client, sample_pdf_bytes, mock_anthropic_provider):
    pid, doc_id = _setup_project_with_extracted_doc(client, sample_pdf_bytes)
    client.post(f"/api/v1/projects/{pid}/documents/{doc_id}/extract-requirements")

    response = client.get(f"/api/v1/projects/{pid}/requirements")
    assert response.status_code == 200
    reqs = response.json()
    assert len(reqs) >= 1


def test_ai_provider_abstraction():
    """Test that the registry can resolve the anthropic provider."""
    from app.ai.registry import ProviderRegistry
    from app.ai.anthropic_provider import AnthropicProvider

    with patch("app.ai.anthropic_provider.anthropic.Anthropic"):
        with patch("app.ai.registry.get_settings") as mock_settings:
            s = MagicMock()
            s.DEFAULT_AI_PROVIDER = "anthropic"
            s.DEFAULT_AI_MODEL = "claude-sonnet-4-6"
            s.ANTHROPIC_API_KEY = "test-key"
            mock_settings.return_value = s

            registry = ProviderRegistry()
            provider = registry.get_provider("anthropic")
            assert isinstance(provider, AnthropicProvider)


def test_invalid_provider_name():
    from app.ai.registry import ProviderRegistry
    with patch("app.ai.registry.get_settings") as mock_settings:
        s = MagicMock()
        s.DEFAULT_AI_PROVIDER = "anthropic"
        mock_settings.return_value = s

        registry = ProviderRegistry()
        with pytest.raises(ValueError, match="Unknown AI provider"):
            registry.get_provider("nonexistent_provider")
