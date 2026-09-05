# PAIR — Final SIH Frontend + Backend

PAIR is an AI-assisted GeM bid compliance review platform.

## Stack

- Frontend: Next.js 14 + React + TypeScript + Tailwind + Framer Motion
- Backend: FastAPI + SQLAlchemy + PostgreSQL/SQLite-compatible configuration
- AI: NVIDIA provider configured server-side
- Documents: PDF extraction + requirement/evidence extraction
- Compliance: requirement-level results, evidence linkage, score/risk and recommendation
- Audit: backend audit events

## Run locally

### 1. Backend

Open a terminal in `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` from `backend/.env.example`.

Put NVIDIA API keys ONLY in the backend `.env`.

Start:

```powershell
python -m uvicorn app.main:app --reload
```

Backend:
`http://127.0.0.1:8000`

### 2. Frontend

Open another terminal in `frontend/`:

```powershell
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_APP_NAME=PAIR
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start:

```powershell
npm run dev
```

Frontend:
`http://localhost:3000`

## Judge demo path

1. Open PAIR landing page.
2. Sign in.
3. Create a Bid Review.
4. Upload a tender PDF.
5. Extract requirements.
6. Upload a bidder/vendor PDF.
7. Extract evidence.
8. Run compliance analysis.
9. Inspect requirement → evidence → verdict.
10. Generate AI recommendation.
11. Open Audit Trail.
12. Use AI Assistant for document-aware questions.

## Security

Never place NVIDIA, database, JWT, or other backend secrets in frontend environment variables or `NEXT_PUBLIC_*`.

The frontend only receives the backend base URL.

## Important product positioning

PAIR is AI-assisted, evidence-first decision support. It does not replace the procurement officer's final decision.

The UI intentionally avoids claiming unsupported government integrations or verification capabilities.

## Design reference

The Stitch export that inspired the final visual system is included under `design/stitch-reference/`.
