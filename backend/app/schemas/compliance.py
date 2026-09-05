from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ComplianceStatus = Literal[
    "compliant",
    "partial",
    "non_compliant",
    "needs_review",
    "insufficient_data",
]


class ComplianceResultCreate(BaseModel):
    project_id: int
    requirement_id: int
    evidence_id: int | None = None
    status: ComplianceStatus = "needs_review"
    explanation: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)


class ComplianceResultResponse(ComplianceResultCreate):
    id: int
    created_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class ComplianceAnalysisRequest(BaseModel):
    project_id: int
    requirement_id: int
    evidence_id: int | None = None
    requirement_text: str
    evidence_text: str
    model_id: str | None = None


class ComplianceSummaryResponse(BaseModel):
    project_id: int
    total_requirements: int
    evaluated_requirements: int
    unevaluated_requirements: int
    compliant: int
    partial: int
    non_compliant: int
    needs_review: int
    insufficient_data: int
    compliance_score: int
    risk_level: Literal["low", "medium", "high"]
    mandatory_failures: list[dict]
