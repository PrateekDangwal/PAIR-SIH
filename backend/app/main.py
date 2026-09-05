from contextlib import asynccontextmanager
import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import Base, engine
from app.api.v1 import (
    ai, audit, auth, compliance, documents, evidence, projects, requirements
)
from app.infrastructure.middleware import request_guard_middleware
from app.infrastructure.metrics import REQUESTS, REQUEST_LATENCY, metrics_response
from app import models  # noqa: F401

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s correlation=%(correlation_id)s %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


class CorrelationFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, "correlation_id"):
            record.correlation_id = "-"
        return True


for handler in logging.getLogger().handlers:
    handler.addFilter(CorrelationFilter())


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Kept for local/demo resilience. Production schema changes should use Alembic.
    Base.metadata.create_all(bind=engine)
    logger.info("PAIR database schema verified")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="PAIR — AI-Powered GeM Bid Compliance Verification Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.middleware("http")(request_guard_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID"],
)

for router in (
    projects.router, documents.router, requirements.router, evidence.router,
    compliance.router, ai.router, audit.router, auth.router,
):
    app.include_router(router, prefix="/api/v1")


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    path = request.url.path
    elapsed = time.perf_counter() - started
    REQUESTS.labels(request.method, path, str(response.status_code)).inc()
    REQUEST_LATENCY.labels(request.method, path).observe(elapsed)
    return response


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, "correlation_id", "-")
    logger.error(
        "Unhandled exception correlation=%s path=%s error=%s",
        correlation_id, request.url.path, exc, exc_info=True,
        extra={"correlation_id": correlation_id},
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "correlation_id": correlation_id,
        },
        headers={"X-Correlation-ID": correlation_id},
    )


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/ready", tags=["Health"])
def readiness():
    from sqlalchemy import text
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ready", "database": "ok"}


@app.get("/metrics", tags=["Observability"])
def metrics():
    return metrics_response()
