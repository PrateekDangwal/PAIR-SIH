from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Literal

VALID_CATEGORIES = Literal[
    "eligibility",
    "technical",
    "financial",
    "mandatory_document",
    "certification",
    "experience",
    "delivery",
    "terms",
    "other",
]

VALID_SEVERITIES = Literal["low", "medium", "high", "critical"]


class ExtractedRequirement(BaseModel):
    """Schema for a single requirement as returned by the AI."""

    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    requirement_text: str = Field(..., min_length=1)
    category: VALID_CATEGORIES = "other"
    is_mandatory: bool = True
    priority: int = Field(default=3)
    severity: VALID_SEVERITIES = "medium"
    source_page_number: Optional[int] = Field(None, ge=1)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)

    @field_validator("priority")
    @classmethod
    def clamp_priority(cls, v: int) -> int:
        return max(1, min(5, v))


class AIExtractionResponse(BaseModel):
    """Pydantic model for the full AI JSON response."""

    requirements: list[ExtractedRequirement]


class RequirementResponse(BaseModel):
    """API response for a stored requirement."""

    id: int
    project_id: int
    source_document_id: int
    title: str
    description: Optional[str]
    requirement_text: str
    category: str
    is_mandatory: bool
    priority: int
    severity: str
    source_page_number: Optional[int]
    extraction_confidence: Optional[float]
    extracted_by_model: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class RequirementExtractionResponse(BaseModel):
    requirements: list[RequirementResponse]
    total_extracted: int
    document_id: int
    project_id: int
    model_used: str
