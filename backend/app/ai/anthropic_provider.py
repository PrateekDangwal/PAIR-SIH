import anthropic
from app.ai.base import AIProvider
from app.ai.models import ModelInfo, ProviderRequest, ProviderResponse
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)


class AnthropicProvider(AIProvider):
    """Anthropic Claude provider for structured JSON extraction."""

    DEFAULT_MODEL = "claude-sonnet-4-6"

    def __init__(self, api_key: str | None = None, model_id: str | None = None):
        settings = get_settings()
        key = api_key or settings.ANTHROPIC_API_KEY
        if not key:
            raise ValueError(
                "ANTHROPIC_API_KEY is not set. "
                "Add it to backend/.env — never expose it to the frontend."
            )
        # Do NOT log the key
        self._client = anthropic.Anthropic(api_key=key)
        self._model_id = model_id or settings.DEFAULT_AI_MODEL or self.DEFAULT_MODEL

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            provider="anthropic",
            model_id=self._model_id,
            display_name=f"Anthropic / {self._model_id}",
            max_tokens=8192,
            supports_json_mode=True,
        )

    async def generate_structured(self, request: ProviderRequest) -> ProviderResponse:
        model = request.model_id or self._model_id

        try:
            message = self._client.messages.create(
                model=model,
                max_tokens=request.max_tokens,
                system=request.system_prompt,
                messages=[{"role": "user", "content": request.user_message}],
                temperature=request.temperature,
            )
        except anthropic.AuthenticationError as exc:
            logger.error("Anthropic authentication failed (check ANTHROPIC_API_KEY)")
            raise RuntimeError("AI provider authentication failed") from exc
        except anthropic.APIConnectionError as exc:
            logger.error("Anthropic API connection error: %s", exc)
            raise RuntimeError("AI provider unavailable") from exc
        except anthropic.RateLimitError as exc:
            logger.error("Anthropic rate limit exceeded")
            raise RuntimeError("AI provider rate limit exceeded") from exc
        except anthropic.APIStatusError as exc:
            logger.error("Anthropic API error %s: %s", exc.status_code, exc.message)
            raise RuntimeError(f"AI provider error: {exc.message}") from exc

        content = ""
        for block in message.content:
            if block.type == "text":
                content += block.text

        return ProviderResponse(
            content=content,
            model_used=model,
            provider="anthropic",
            input_tokens=message.usage.input_tokens,
            output_tokens=message.usage.output_tokens,
            raw_response=None,  # Never store raw response (may contain sensitive data)
        )
