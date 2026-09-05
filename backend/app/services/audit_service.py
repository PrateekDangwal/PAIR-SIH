import json
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent


def record_audit(
    db: Session,
    action: str,
    project_id: int | None = None,
    actor: str = "system",
    details: dict | str | None = None,
) -> AuditEvent:
    if isinstance(details, dict):
        details_value = json.dumps(details, ensure_ascii=False)
    else:
        details_value = details

    event = AuditEvent(
        project_id=project_id,
        action=action,
        actor=actor,
        details=details_value,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def list_audit_events(
    db: Session,
    project_id: int | None = None,
    limit: int = 100,
) -> list[AuditEvent]:
    stmt = select(AuditEvent).order_by(AuditEvent.created_at.desc(), AuditEvent.id.desc()).limit(limit)
    if project_id is not None:
        stmt = stmt.where(AuditEvent.project_id == project_id)
    return list(db.scalars(stmt))
