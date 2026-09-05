from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone

from app.config import get_settings

logger = logging.getLogger(__name__)

try:
    import redis
except ImportError:
    redis = None


class JobQueue:
    """Small Redis Streams queue for long-running work.

    Current HTTP endpoints remain synchronous for frontend compatibility.
    New asynchronous consumers can enqueue work here without changing domain
    services or API contracts.
    """

    STREAM = "pair:jobs"

    def __init__(self):
        self.redis = None
        url = get_settings().REDIS_URL
        if url and redis:
            try:
                self.redis = redis.Redis.from_url(url, decode_responses=True)
            except Exception as exc:
                logger.warning("Job queue initialization failed: %s", exc)

    def enqueue(self, job_type: str, payload: dict) -> str:
        job_id = uuid.uuid4().hex
        if not self.redis:
            raise RuntimeError("REDIS_URL is required to enqueue background jobs")
        self.redis.xadd(
            self.STREAM,
            {
                "job_id": job_id,
                "job_type": job_type,
                "payload": json.dumps(payload),
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
        return job_id


job_queue = JobQueue()
