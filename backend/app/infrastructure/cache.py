from __future__ import annotations

import json
import logging
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)

try:
    import redis
except ImportError:  # optional dependency
    redis = None


class Cache:
    """Optional Redis cache. The API remains fully functional when Redis is absent."""

    def __init__(self):
        self.url = get_settings().REDIS_URL
        self.client = None
        if self.url and redis:
            try:
                self.client = redis.Redis.from_url(self.url, decode_responses=True)
            except Exception as exc:
                logger.warning("Redis initialization failed: %s", exc)

    def get_json(self, key: str) -> Any | None:
        if not self.client:
            return None
        try:
            value = self.client.get(key)
            return json.loads(value) if value else None
        except Exception as exc:
            logger.warning("Redis get failed: %s", exc)
            return None

    def set_json(self, key: str, value: Any, ttl: int | None = None) -> None:
        if not self.client:
            return
        try:
            self.client.setex(
                key,
                ttl or get_settings().CACHE_TTL_SECONDS,
                json.dumps(value, default=str),
            )
        except Exception as exc:
            logger.warning("Redis set failed: %s", exc)

    def delete(self, *keys: str) -> None:
        if not self.client or not keys:
            return
        try:
            self.client.delete(*keys)
        except Exception as exc:
            logger.warning("Redis delete failed: %s", exc)


cache = Cache()
