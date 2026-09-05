from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class DocumentResponse(BaseModel):
    id: int
    project_id: int
    filename: str
    file_size: int
    mime_type: str
    document_type: str
    extraction_status: str
    page_count: Optional[int]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentExtractionResponse(BaseModel):
    id: int
    project_id: int
    filename: str
    extraction_status: str
    page_count: Optional[int]
    text_length: Optional[int]
    message: str
    model_config = ConfigDict(from_attributes=True)
