from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.audit import AuditEventResponse
from app.services.audit_service import list_audit_events

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/events", response_model=list[AuditEventResponse])
def get_audit_events(
    project_id: int | None = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return list_audit_events(db, project_id=project_id, limit=limit)
