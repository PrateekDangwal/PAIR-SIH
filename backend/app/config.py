from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:password@localhost:5432/pair_db"
    )

    ANTHROPIC_API_KEY: str = Field(default="")

    NVIDIA_API_KEY: str = Field(default="")
    NVIDIA_API_KEYS: str = Field(default="")
    NVIDIA_BASE_URL: str = Field(default="https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL: str = Field(default="openai/gpt-oss-20b")
    NVIDIA_FALLBACK_MODELS: str = Field(default="")

    DEFAULT_AI_PROVIDER: str = Field(default="nvidia")
    DEFAULT_AI_MODEL: str = Field(default="openai/gpt-oss-20b")

    MAX_UPLOAD_SIZE_MB: int = Field(default=50)
    UPLOAD_DIR: str = Field(default="uploads")

    APP_NAME: str = "PAIR Backend"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = Field(default=False)

    # Security. REQUIRE_AUTH remains false by default so the current demo UI
    # keeps working; set true for a protected deployment after the UI sends JWTs.
    REQUIRE_AUTH: bool = Field(default=False)
    JWT_SECRET_KEY: str = Field(default="")
    JWT_ACCESS_MINUTES: int = Field(default=30)
    JWT_REFRESH_DAYS: int = Field(default=14)

    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")
    RATE_LIMIT_PER_MINUTE: int = Field(default=120)
    MAX_REQUEST_BODY_MB: int = Field(default=55)

    REDIS_URL: str = Field(default="")
    CACHE_TTL_SECONDS: int = Field(default=60)

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def max_request_body_bytes(self) -> int:
        return self.MAX_REQUEST_BODY_MB * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        p = Path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def nvidia_api_keys(self) -> list[str]:
        keys: list[str] = []
        if self.NVIDIA_API_KEY.strip():
            keys.append(self.NVIDIA_API_KEY.strip())
        if self.NVIDIA_API_KEYS.strip():
            keys.extend(
                key.strip()
                for key in self.NVIDIA_API_KEYS.split(",")
                if key.strip()
            )
        return list(dict.fromkeys(keys))

    @property
    def nvidia_fallback_models(self) -> list[str]:
        return [
            model.strip()
            for model in self.NVIDIA_FALLBACK_MODELS.split(",")
            if model.strip()
        ]

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
