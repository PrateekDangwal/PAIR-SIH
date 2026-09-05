from pydantic import BaseModel
from typing import Any, Optional


class ModelInfo(BaseModel):
    provider: str
    model_id: str
    display_name: str
    max_tokens: int
    supports_json_mode: bool = False


class ProviderRequest(BaseModel):
    system_prompt: str
    user_message: str
    max_tokens: int = 4096
    temperature: float = 0.1
    model_id: Optional[str] = None


class ProviderResponse(BaseModel):
    content: str
    model_used: str
    provider: str
    input_tokens: int = 0
    output_tokens: int = 0
    raw_response: Optional[Any] = None
