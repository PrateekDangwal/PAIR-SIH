from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    project_id: int
    recommendation: str
    model_used: str
    provider: str

