# PAIR — SIH FINAL PACKAGE

This package contains the polished PAIR frontend and the existing PAIR FastAPI backend.

## Folders
- `frontend/` — Next.js application with the Stitch-inspired production UI and live API integration.
- `backend/` — FastAPI compliance backend.
- `design/stitch-reference/` — Stitch reference screens/design notes.

## Quick start

Backend:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# create backend/.env from backend/.env.example
python -m uvicorn app.main:app --reload
```

Frontend:
```powershell
cd frontend
npm install
# create frontend/.env.local:
# NEXT_PUBLIC_APP_NAME=PAIR
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```

Open `http://localhost:3000`.

NVIDIA API keys stay only in `backend/.env`. Never put them in frontend code or `NEXT_PUBLIC_*` variables.

Core judge flow:
Landing → Bid Review → Upload Tender → Extract Requirements → Upload Bidder PDF → Extract Evidence → Run Compliance Analysis → Inspect Evidence → Generate Recommendation → Audit Trail.

PAIR is AI-assisted decision support; the procurement officer retains final decision authority.
