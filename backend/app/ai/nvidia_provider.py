from __future__ import annotations

import logging

from openai import AsyncOpenAI

from app.ai.base import AIProvider
from app.ai.models import ModelInfo, ProviderRequest, ProviderResponse
from app.config import get_settings

logger = logging.getLogger(__name__)


class NVIDIAProvider(AIProvider):
    """NVIDIA NIM provider with server-side key rotation and model fallback."""

    def __init__(self):
        settings = get_settings()
        keys = settings.nvidia_api_keys
        if not keys:
            raise ValueError("NVIDIA_API_KEY is not configured")

        self.default_model = settings.NVIDIA_MODEL
        self.fallback_models = settings.nvidia_fallback_models
        self._clients = [
            AsyncOpenAI(
                api_key=key,
                base_url=settings.NVIDIA_BASE_URL,
                timeout=180.0,
                max_retries=0,
            )
            for key in keys
        ]
        self._key_index = 0

    def get_model_info(self) -> ModelInfo:
        return ModelInfo(
            provider="nvidia",
            model_id=self.default_model,
            display_name=f"NVIDIA NIM / {self.default_model}",
            max_tokens=16384,
            supports_json_mode=True,
        )

    @staticmethod
    def _should_try_next(exc: Exception) -> bool:
        status = getattr(exc, "status_code", None)
        return status in {408, 409, 410, 429, 500, 502, 503, 504} or status is None

    async def _call(self, client: AsyncOpenAI, model: str, request: ProviderRequest):
        kwargs = {
            "model": model,
            "messages": [
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_message},
            ],
            "temperature": request.temperature,
            "max_tokens": request.max_tokens,
            "stream": False,
        }
        if model.startswith("openai/gpt-oss"):
            kwargs["reasoning_effort"] = "low"
        return await client.chat.completions.create(**kwargs)

    async def generate_structured(self, request: ProviderRequest) -> ProviderResponse:
        requested = request.model_id or self.default_model
        models_to_try = [requested] + [m for m in self.fallback_models if m != requested]
        last_error: Exception | None = None
        start_index = self._key_index

        for candidate_model in models_to_try:
            for offset in range(len(self._clients)):
                key_index = (start_index + offset) % len(self._clients)
                try:
                    completion = await self._call(
                        self._clients[key_index], candidate_model, request
                    )
                    self._key_index = (key_index + 1) % len(self._clients)
                    message = completion.choices[0].message
                    usage = completion.usage
                    return ProviderResponse(
                        content=message.content or "",
                        model_used=candidate_model,
                        provider="nvidia",
                        input_tokens=usage.prompt_tokens if usage else 0,
                        output_tokens=usage.completion_tokens if usage else 0,
                        raw_response=completion.model_dump(),
                    )
                except Exception as exc:
                    last_error = exc
                    if not self._should_try_next(exc):
                        raise RuntimeError(f"NVIDIA provider error: {exc}") from exc
                    logger.warning(
                        "NVIDIA request failed model=%s key_slot=%d status=%s",
                        candidate_model, key_index + 1, getattr(exc, "status_code", None)
                    )

        raise RuntimeError(
            f"NVIDIA provider unavailable after {len(self._clients)} key(s) "
            f"and {len(models_to_try)} model option(s): {last_error}"
        ) from last_error
