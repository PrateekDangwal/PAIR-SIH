from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.evidence import EvidenceResponse, EvidenceExtractionResponse
from app.services.project_service import ProjectService
from app.services.document_service import DocumentService
from app.services.evidence_service import EvidenceService

router = APIRouter(tags=["Evidence"])


@router.post(
    "/projects/{project_id}/documents/{document_id}/extract-evidence",
    response_model=EvidenceExtractionResponse,
)
async def extract_evidence(
    project_id: int,
    document_id: int,
    provider: str = Query(default="nvidia", description="AI provider to use"),
    db: Session = Depends(get_db),
):
    """Extract factual evidence from a vendor PDF using AI.

    Steps:
    1. Verify project and document ownership
    2. Verify document is a vendor document
    3. Verify text extraction is complete
    4. Send text to AI provider (Claude)
    5. Validate AI JSON with Pydantic
    6. Store evidence in PostgreSQL
    7. Return structured response

    The document must have been uploaded with document_type=vendor
    and had /extract called first.
    """
    ProjectService(db).get(project_id)
    doc_svc = DocumentService(db)
    document = doc_svc.get(document_id, project_id)

    ev_svc = EvidenceService(db)
    evidence, model_used = await ev_svc.extract_and_store(document, provider_name=provider)

    return EvidenceExtractionResponse(
        evidence=evidence,
        total_extracted=len(evidence),
        document_id=document_id,
        project_id=project_id,
        model_used=model_used,
    )


@router.get(
    "/projects/{project_id}/documents/{document_id}/evidence",
    response_model=list[EvidenceResponse],
)
def get_document_evidence(
    project_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    """Get all evidence extracted from a specific document."""
    ProjectService(db).get(project_id)
    DocumentService(db).get(document_id, project_id)

    ev_svc = EvidenceService(db)
    return ev_svc.get_document_evidence(document_id)


@router.get(
    "/projects/{project_id}/evidence",
    response_model=list[EvidenceResponse],
)
def get_project_evidence(
    project_id: int,
    evidence_type: str | None = Query(None, description="Filter by evidence_type"),
    db: Session = Depends(get_db),
):
    """Get all evidence for a project, optionally filtered by type."""
    ProjectService(db).get(project_id)

    ev_svc = EvidenceService(db)
    evidence = ev_svc.get_project_evidence(project_id)

    if evidence_type:
        evidence = [e for e in evidence if e.evidence_type == evidence_type]

    return evidence
