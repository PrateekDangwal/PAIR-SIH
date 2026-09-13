# PAIR Frontend — Industrial Procurement Intelligence

PAIR is an AI-powered procurement intelligence frontend for GeM bid review.

## Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Run locally

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://pair-sih.onrender.com
```

Then:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Backend contract

The frontend intentionally keeps the existing backend API contract under `/api/v1`:

- `/api/v1/auth/*`
- `/api/v1/projects/*`
- `/api/v1/projects/{id}/documents/*`
- `/api/v1/projects/{id}/requirements`
- `/api/v1/projects/{id}/evidence`
- `/api/v1/compliance/*`
- `/api/v1/ai/*`
- `/api/v1/audit/events`

No AI provider keys are required in the frontend. Provider credentials belong in the backend environment only.

## UI

The interface follows the supplied Industrial Skeuomorphism / Industrial Realism system:
- cool industrial chassis
- raised and recessed neumorphic surfaces
- physical button press states
- technical monospace labels
- screws, vents, LEDs and screen surfaces
- responsive mobile-first layouts
- restrained mechanical motion
- reduced-motion support

The startup sequence runs once per browser session and can be skipped with Escape or Enter.

## Routes

Public:
- `/`
- `/about`
- `/how-it-works`
- `/contact`
- `/login`
- `/signup`

Application:
- `/app`
- `/app/projects`
- `/app/projects/[id]`
- `/app/chat`
- `/app/artifacts`
- `/app/activity`
- `/app/models`
- `/app/settings`
