from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Literal

VALID_EVIDENCE_TYPES = Literal[
    "eligibility",
    "technical",
    "financial",
    "certification",
    "experience",
    "delivery",
    "mandatory_document",
    "terms",
    "other",
]


class ExtractedEvidence(BaseModel):
    """Schema for a single evidence item as returned by the AI."""

    evidence_text: str = Field(..., min_length=1)
    evidence_type: VALID_EVIDENCE_TYPES = "other"
    source_page_number: Optional[int] = Field(None, ge=1)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)


class AIEvidenceResponse(BaseModel):
    """Pydantic model for the full AI JSON response for evidence extraction."""

    evidence: list[ExtractedEvidence]


class EvidenceResponse(BaseModel):
    """API response for a stored evidence item."""

    id: int
    project_id: int
    source_document_id: int
    evidence_text: str
    evidence_type: str
    source_page_number: Optional[int]
    confidence: Optional[float]
    extracted_by_model: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class EvidenceExtractionResponse(BaseModel):
    evidence: list[EvidenceResponse]
    total_extracted: int
    document_id: int
    project_id: int
    model_used: str
