from __future__ import annotations

import time
import uuid
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse

from app.config import get_settings

_windows: dict[str, deque[float]] = defaultdict(deque)


async def request_guard_middleware(request: Request, call_next):
    settings = get_settings()
    request.state.correlation_id = request.headers.get("X-Correlation-ID") or uuid.uuid4().hex
    request.state.started_at = time.perf_counter()

    # Protect the application from accidentally huge non-upload requests.
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > settings.max_request_body_bytes:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body exceeds configured size limit."},
                    headers={"X-Correlation-ID": request.state.correlation_id},
                )
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid Content-Length header."},
                headers={"X-Correlation-ID": request.state.correlation_id},
            )


    # Optional deployment-wide authentication gate. Auth endpoints and
    # health/observability remain public.
    if settings.REQUIRE_AUTH and request.url.path.startswith("/api/v1/") and not request.url.path.startswith("/api/v1/auth/"):
        from fastapi.security.utils import get_authorization_scheme_param
        from app.security.auth import decode_token
        authorization = request.headers.get("Authorization", "")
        scheme, token = get_authorization_scheme_param(authorization)
        if scheme.lower() != "bearer" or not token:
            return JSONResponse(
                status_code=401,
                content={"detail": "Authentication required", "correlation_id": request.state.correlation_id},
                headers={"X-Correlation-ID": request.state.correlation_id},
            )
        try:
            decode_token(token, "access")
        except ValueError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired access token", "correlation_id": request.state.correlation_id},
                headers={"X-Correlation-ID": request.state.correlation_id},
            )

    # Lightweight process-local limiter. Redis-backed rate limiting can be
    # enabled later without changing the API contract.
    client = request.client.host if request.client else "unknown"
    key = f"{client}:{request.url.path}"
    now = time.time()
    window = _windows[key]
    while window and now - window[0] >= 60:
        window.popleft()
    if len(window) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please retry shortly."},
            headers={
                "Retry-After": "60",
                "X-Correlation-ID": request.state.correlation_id,
            },
        )
    window.append(now)

    response = await call_next(request)
    response.headers["X-Correlation-ID"] = request.state.correlation_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cache-Control"] = (
        "no-store" if request.url.path.startswith("/api/") else "no-cache"
    )
    return response
