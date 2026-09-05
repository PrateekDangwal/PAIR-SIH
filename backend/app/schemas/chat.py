from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=12000)
    project_id: int | None = None
    model_id: str | None = None


class ChatResponse(BaseModel):
    message: str
    model_used: str
    provider: str
