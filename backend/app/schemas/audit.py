from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AuditEventResponse(BaseModel):
    id: int
    project_id: int | None
    action: str
    actor: str
    details: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
