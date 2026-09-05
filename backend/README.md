# PAIR Backend — Final Sprint

AI-Powered GeM Bid Compliance Verification Platform.

## Stack

- FastAPI + Python
- SQLAlchemy 2 + PostgreSQL
- Alembic migrations
- PyMuPDF PDF extraction
- NVIDIA NIM / optional Anthropic provider
- JWT access + refresh tokens with Argon2 password hashing
- Optional Redis cache
- Prometheus metrics
- Correlation IDs, security headers and rate limiting

## Run

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Swagger: `http://localhost:8000/docs`

## Environment

Copy `.env.example` to `.env`.

AI provider keys are server-side only. Never put them in frontend code or
`NEXT_PUBLIC_*` variables.

`REQUIRE_AUTH=false` preserves compatibility with the current demo UI.
Set it to `true` when the frontend is configured to send the JWT access token.

## Authentication API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

## Health / Observability

- `GET /health`
- `GET /ready` — verifies DB connectivity
- `GET /metrics` — Prometheus metrics
- `GET /docs`

## GeM compliance flow

Tender PDF → text extraction → AI requirements → bidder PDF → evidence
extraction → strict domain evidence matching → AI verification → weighted
compliance score/risk → procurement recommendation → audit trail.

## Security notes

- Passwords are Argon2-hashed.
- JWT secrets remain server-side.
- Uploads use UUID filenames and PDF validation.
- CORS is allow-list based.
- Request size and per-IP/path rate limits are applied.
- API errors do not expose stack traces.
- Correlation IDs are returned as `X-Correlation-ID`.
- Use HTTPS and a strong random JWT secret in production.
- Use Alembic for production schema changes.

## Production infrastructure

Redis support is included as an optional cache abstraction. The application
continues to operate without Redis, which keeps the hackathon demo easy to run.
For a production deployment, attach managed Redis and move rate limiting to a
shared Redis-backed implementation across multiple API instances.

Long-running AI extraction is still executed synchronously in the current
demo-compatible API contract. A queue worker should be introduced when the
frontend is ready to consume asynchronous job IDs rather than blocking on
extraction.
