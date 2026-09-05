from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import Document
from app.schemas.document import DocumentExtractionResponse, DocumentResponse
from app.services.audit_service import record_audit
from app.services.document_service import DocumentService
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects/{project_id}/documents", tags=["Documents"])


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    project_id: int,
    file: UploadFile = File(...),
    document_type: str = Query(default="bid"),
    db: Session = Depends(get_db),
):
    ProjectService(db).get(project_id)
    if document_type not in {"bid", "vendor", "tender", "other"}:
        document_type = "other"
    svc = DocumentService(db)
    document = await svc.upload(project_id, file, document_type=document_type)
    record_audit(db, "document_uploaded", project_id, "user", {
        "document_id": document.id,
        "filename": document.filename,
        "document_type": document.document_type,
    })
    return document


@router.get("", response_model=list[DocumentResponse])
def list_documents(project_id: int, db: Session = Depends(get_db)):
    ProjectService(db).get(project_id)
    stmt = select(Document).where(Document.project_id == project_id).order_by(Document.created_at.desc())
    return list(db.scalars(stmt))


@router.post("/{document_id}/extract", response_model=DocumentExtractionResponse)
def extract_text(project_id: int, document_id: int, db: Session = Depends(get_db)):
    svc = DocumentService(db)
    document = svc.get(document_id, project_id)
    document = svc.extract_text(document)
    record_audit(db, "document_text_extracted", project_id, "system", {
        "document_id": document.id,
        "pages": document.page_count,
    })
    return DocumentExtractionResponse(
        id=document.id,
        project_id=document.project_id,
        filename=document.filename,
        extraction_status=document.extraction_status,
        page_count=document.page_count,
        text_length=len(document.raw_text) if document.raw_text else 0,
        message=f"Extracted {document.page_count} pages successfully.",
    )
