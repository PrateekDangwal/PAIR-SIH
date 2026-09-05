from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.schemas.requirement import RequirementResponse, RequirementExtractionResponse
from app.services.project_service import ProjectService
from app.services.document_service import DocumentService
from app.services.requirement_service import RequirementService
from app.models.requirement import Requirement

router = APIRouter(prefix="/projects/{project_id}", tags=["Requirements"])


@router.post(
    "/documents/{document_id}/extract-requirements",
    response_model=RequirementExtractionResponse,
)
async def extract_requirements(
    project_id: int,
    document_id: int,
    provider: str = Query(default="nvidia", description="AI provider to use"),
    db: Session = Depends(get_db),
):
    """Send extracted bid text to the AI provider and store structured requirements.

    Steps:
    1. Verify project and document ownership
    2. Verify text extraction is complete
    3. Send text to Claude (or configured provider)
    4. Validate AI JSON with Pydantic
    5. Store requirements in PostgreSQL
    6. Return structured response
    """
    # Ownership checks
    ProjectService(db).get(project_id)
    doc_svc = DocumentService(db)
    document = doc_svc.get(document_id, project_id)

    req_svc = RequirementService(db)
    requirements, model_used = await req_svc.extract_and_store(
        document, provider_name=provider
    )

    return RequirementExtractionResponse(
        requirements=requirements,
        total_extracted=len(requirements),
        document_id=document_id,
        project_id=project_id,
        model_used=model_used,
    )


@router.get("/requirements", response_model=list[RequirementResponse])
def list_requirements(
    project_id: int,
    category: str | None = Query(None),
    is_mandatory: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    """List all requirements for a project with optional filters."""
    ProjectService(db).get(project_id)

    stmt = select(Requirement).where(Requirement.project_id == project_id)
    if category:
        stmt = stmt.where(Requirement.category == category)
    if is_mandatory is not None:
        stmt = stmt.where(Requirement.is_mandatory == is_mandatory)
    stmt = stmt.order_by(Requirement.priority.desc(), Requirement.created_at)

    return list(db.scalars(stmt))
