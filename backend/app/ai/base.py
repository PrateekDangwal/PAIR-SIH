from abc import ABC, abstractmethod
from app.ai.models import ModelInfo, ProviderRequest, ProviderResponse


class AIProvider(ABC):
    """Abstract base for all AI providers.

    Sprint 2: Only AnthropicProvider is implemented.
    Sprint 3+: Add OpenAI, Gemini, DeepSeek by subclassing this.
    """

    @abstractmethod
    def get_model_info(self) -> ModelInfo:
        """Return metadata about the model / provider."""
        ...

    @abstractmethod
    async def generate_structured(self, request: ProviderRequest) -> ProviderResponse:
        """Send a prompt and return the raw text response.

        The caller is responsible for parsing JSON out of ProviderResponse.content.
        """
        ...

    @property
    def provider_name(self) -> str:
        return self.get_model_info().provider
