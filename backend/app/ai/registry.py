import logging
from typing import Dict, Type

from app.ai.anthropic_provider import AnthropicProvider
from app.ai.base import AIProvider
from app.ai.nvidia_provider import NVIDIAProvider
from app.config import get_settings

logger = logging.getLogger(__name__)

_PROVIDER_MAP: Dict[str, Type[AIProvider]] = {
    "anthropic": AnthropicProvider,
    "nvidia": NVIDIAProvider,
}


class ProviderRegistry:
    """Central registry for PAIR AI providers and model metadata."""

    def __init__(self):
        self._settings = get_settings()

    def get_provider(self, name: str | None = None) -> AIProvider:
        provider_name = name or self._settings.DEFAULT_AI_PROVIDER
        cls = _PROVIDER_MAP.get(provider_name)
        if cls is None:
            available = list(_PROVIDER_MAP.keys())
            raise ValueError(
                f"Unknown AI provider '{provider_name}'. Available: {available}"
            )
        logger.debug("Instantiating AI provider: %s", provider_name)
        return cls()

    def list_providers(self) -> list[str]:
        return list(_PROVIDER_MAP.keys())

    def list_model_catalog(self) -> list[dict]:
        settings = self._settings
        models = [
            {
                "id": "openai/gpt-oss-20b",
                "name": "GPT-OSS 20B",
                "provider": "NVIDIA NIM",
                "status": "configured" if settings.nvidia_api_keys else "not_configured",
                "capabilities": ["reasoning", "analysis", "structured-output"],
            },
            {
                "id": "deepseek-ai/deepseek-v4-pro-0813",
                "name": "DeepSeek V4 Pro",
                "provider": "NVIDIA NIM",
                "status": "available_via_nvidia",
                "capabilities": ["reasoning", "coding", "long-context"],
            },
            {
                "id": "moonshotai/kimi-k3",
                "name": "Kimi K3",
                "provider": "NVIDIA NIM",
                "status": "available_via_nvidia",
                "capabilities": ["reasoning", "agentic", "multimodal"],
            },
            {
                "id": "nvidia/nemotron-3.5-lightning-30b-a3b",
                "name": "Nemotron 3.5 Lightning 30B",
                "provider": "NVIDIA NIM",
                "status": "available_via_nvidia",
                "capabilities": ["fast-reasoning", "analysis", "agents"],
            },
            {
                "id": "nvidia/nemotron-ocr-v2",
                "name": "Nemotron OCR v2",
                "provider": "NVIDIA NIM",
                "status": "document-specialist",
                "capabilities": ["ocr", "table-extraction", "multilingual"],
            },
        ]
        return models

    def status(self) -> dict:
        settings = self._settings
        return {
            "default_provider": settings.DEFAULT_AI_PROVIDER,
            "default_model": settings.DEFAULT_AI_MODEL,
            "nvidia_keys_configured": len(settings.nvidia_api_keys),
            "nvidia_fallback_models": settings.nvidia_fallback_models,
            "providers": self.list_providers(),
        }
