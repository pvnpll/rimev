# Testing & Deployment Guide

## Prerequisites

- **Node.js 20+**
- **Docker Desktop** (for local PostgreSQL) or Supabase connection
- **npm**

## One-Command Setup

```bash
cd rimev
npm run setup
```

This will:

1. Copy `.env.example` → `.env` (if missing)
2. Run `npm install`
3. Start PostgreSQL via Docker Compose
4. Push the Prisma schema
5. Seed demo data (1 user, 1 deck, 1 lesson, 3 cards)

## Run the App

### Development

```bash
npm run dev
```

Open **http://localhost:3000**

### Production mode (local)

```bash
npm run prod
```

## Verify Everything Works

```bash
npm run check
```

Runs: TypeScript → unit tests → production build

### Health check

```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

## Manual Test Checklist (v1.10.0)

### Guest (unauthenticated)

| Step | URL | Verify |
|------|-----|--------|
| 1 | `/` | Redirects to `/explore` with public decks |
| 2 | `/explore` | Browse decks, tap public deck to preview |
| 3 | `/decks/[id]` | Tap lesson to study via swipe cards in guest mode |
| 4 | `/practice` or `/review` | Auth wall prompt with "Continue as guest" escape hatch |

### Without Supabase (mock user)

| Step | URL | Verify |
|------|-----|--------|
| 1 | `/` or `/login` | Redirects to `/practice` with a swipe card |
| 2 | `/practice` | Reveal card, rate 1–5, next card loads |
| 3 | `/dashboard` | Due count, streak, Practice + Daily Review buttons |
| 4 | `/decks` | Lists seeded "Getting Started" deck |
| 5 | `/decks/[id]` | Rename deck (pencil), lessons list, practice lesson |
| 6 | `/review` | Due cards, reveal, rate 1–5 (Daily Review) |
| 7 | `/ai` | Generate cards via SSE, view progressive cards |
| 8 | `/settings/import` | Upload JSON loads text; Import JSON button required |
| 9 | `/search` | Search "hello" or deck title |
| 10 | `/settings` | Theme toggle, about text mentions Practice and Daily Review |

### With Supabase Auth

| Step | URL | Verify |
|------|-----|--------|
| 1 | `/login` | Sign in with email/password or username |
| 2 | `/auth/callback` | Redirects to `/practice` after authentication |
| 3 | `/settings` | Account section shows email and username |
| 4 | Sign out → `/explore` | Returns unauthenticated users to Explore |

### After Daily Review session

| Step | Verify |
|------|--------|
| Dashboard | Due count decreased, reviewed today increased |
| Review again | Fewer or zero due cards |

## Seeded Demo Data

- User: mock user (`MOCK_USER_ID` in `.env`)
- Deck: "Getting Started"
- Lesson: "Basics"
- Cards: 3 cards due immediately

## Automated Tests

| Type | Command | Coverage |
|------|---------|----------|
| Unit | `npm test` | 48 tests: Schedulers, AI generation, providers, validators, dedup, session |
| Typecheck | `npm run typecheck` | TypeScript compiler (`tsc --noEmit`) |
| All | `npm run check` | typecheck + unit + build |
| E2E | `npm run test:e2e` | Playwright suites: Health, nav, decks, review, AI smoke, theme |

E2E uses iPhone 13 viewport (mobile-first).

## Deploy to Vercel

See [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md).

**Critical:** Set Vercel **Root Directory** to `rimev`.

**Production:** `https://rimev.vercel.app`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on dev | Kill stale `next` processes, `rm -rf .next`, restart |
| DB connection failed | Check `DATABASE_URL`; use Supabase pooler port 6543 in prod |
| Login redirect loop | Add callback URL in Supabase auth settings |
| Site 404 on Vercel | Root Directory must be `rimev`; redeploy |
| Slow review on mobile | Ensure `regions: ["bom1"]` in `vercel.json` is deployed |
