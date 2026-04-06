# Pacer — Frontend

Next.js 16 + TypeScript app.

## Requirements

- Node.js 18+
- pnpm (`npm install -g pnpm` or use `npx pnpm`)

## Setup

```bash
cp .env.local.example .env.local  # or create manually
```

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Install dependencies:

```bash
npx pnpm install
```

## Run

```bash
npx pnpm dev
```

App starts on `http://localhost:3000`.

## Build

```bash
npx pnpm build
```

## Key pages

| Path | Description |
|------|-------------|
| `/login` | Google OAuth login |
| `/auth/callback` | OAuth redirect handler — saves JWT, redirects to `/profile` |
| `/profile` | CV template URL input + Google Docs iframe preview |
| `/jobs` | Job listings |
| `/resumes` | Generated job-specific resumes (planned) |

## Auth flow

1. Click "Continue with Google" → redirects to `{API_URL}/oauth2/authorization/google`
2. Google OAuth completes on the backend
3. Backend redirects to `/auth/callback?token=<jwt>`
4. Token saved to `localStorage` (`pacer_token`)
5. All API calls include `Authorization: Bearer <token>` via `lib/api.ts`

## Structure

```
app/
  auth/callback/  — OAuth callback handler
  login/          — Login page
  profile/        — User profile + CV template iframe
  jobs/           — Job listings
lib/
  auth.ts         — Token helpers (get/set/remove)
  api.ts          — Fetch wrapper with Bearer token
components/       — shadcn/ui components
```
