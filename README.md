# Rimev

A mobile-first, subject-agnostic spaced repetition learning platform.

**v1.10.0** — Practice, Daily Review, Swipe UX, AI Generation, and PWA at [rimev.pvnpll.in](https://rimev.pvnpll.in) (or [rimev.vercel.app](https://rimev.vercel.app))

## What You Can Do

- **Practice** endlessly on app open (adaptive queue, recent decks, gesture-driven swipe cards)
- **Daily Review** for spaced repetition with 1–5 ratings when cards are due
- **AI Mode** with progressive streaming generation (SSE), provider cascade (Gemini & OpenRouter), difficulty scaling, and topic suggestions
- **Explore & Guest Mode** to browse public decks and practice without signing in
- Create, import, and share decks with lessons and flashcards
- Track progress on the dashboard (due count, streak, total cards, mature cards)
- Sign in with Supabase Auth (email or username) or install as an iOS/Android Progressive Web App (PWA)

## Documentation

| Doc | Audience |
|-----|----------|
| [v1 Release Snapshot](./docs/application/v1-release.md) | Everyone — what's in v1 |
| [Layman Guide](./docs/application/layman-guide.md) | Non-technical users |
| [Technical Reference](./docs/application/technical-reference.md) | Developers |
| [Progress & Roadmap](./docs/application/progress-and-roadmap.md) | Features by release version |
| [Release Versioning](./docs/application/release-versioning.md) | SemVer policy |
| [CHANGELOG](./CHANGELOG.md) | Shipped versions |
| [Deploy Guide](./docs/DEPLOY-VERCEL.md) | Vercel + Supabase setup |
| [Architecture](./docs/architecture/README.md) | System design |
| [Testing](./docs/TESTING.md) | Local dev and QA |

## Quick Start

```bash
cd rimev
npm run setup    # Docker Postgres + schema + seed
npm run dev      # http://localhost:3000
```

Without Supabase env vars, the app uses a mock user (no login required).

### Supabase Auth

```bash
# Option A: Cursor MCP (see .cursor/mcp.json at repo root)
# Option B: Connect script
SUPABASE_ACCESS_TOKEN="sbp_..." SUPABASE_PROJECT_REF="your-ref" npm run supabase:connect
```

Add redirect URL `http://localhost:3000/auth/callback` in Supabase dashboard.

## Feature Status (v1.10.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Practice Mode | ✅ Shipped | Endless adaptive practice (`PracticeScheduler`) with swipe deck UX |
| Daily Review | ✅ Shipped | Spaced repetition queue with 1–5 rating intervals |
| Guest Mode & Public Browse | ✅ Shipped | Explore public decks and practice without an account (v1.6.0) |
| Dashboard & Overview | ✅ Shipped | Due today, reviewed count, total/mature cards, and streak calculation |
| Decks + Explore | ✅ Shipped | Public/private sharing, author attribution, library import |
| Lessons Management | ✅ Shipped | Create/rename/delete lessons with lesson-scoped practice |
| Deck Title & Setting Edit | ✅ Shipped | Inline title editing (44px target), visibility toggle, deck deletion |
| Card UI & Management | ⚠️ Partial | Full API CRUD (`/api/decks/[id]/cards`) and UI components (`CreateCardForm`, `EditCardForm`, `CardList`); main deck view currently organizes cards within lessons |
| AI Card Generation | ✅ Shipped | SSE streaming generation, provider cascade, context memory, and tutor notes |
| PWA Support | ✅ Shipped | Static manifest, Apple web app meta tags, and service worker (v1.10.0) |
| JSON Deck Export | ⏳ Planned | Full library/deck export planned for v1.12.0 |
| Dedicated Statistics / Charts | ⏳ Planned | Detailed historical charts planned for v1.13.0 (dashboard metrics are shipped) |
| Tags UI | ⏳ Planned | Taxonomy and filtering planned for v2.0.0 |

See [progress-and-roadmap.md](./docs/application/progress-and-roadmap.md) for upcoming phases and release history.

## Known Limitations

- **Card Organization**: Standalone card creation and editing forms exist in `src/features/cards/`, but the primary deck detail page (`/decks/[id]`) organizes cards via lessons.
- **Statistics**: Dashboard displays overview counts and streaks; interactive visual charts (`/statistics`) remain planned.
- **Export**: JSON deck import is supported; full library and deck export is planned.
- **Offline Writes**: Offline review and practice queue syncing require an active network connection to Supabase.

## Scripts & Verification

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with Turbopack |
| `npm run typecheck` | TypeScript static analysis (`tsc --noEmit`) |
| `npm test` | Run 48 unit tests across 10 test suites via Vitest |
| `npm run check` | Combined verification: `typecheck` + `test` + `build` |
| `npm run test:e2e` | Playwright end-to-end test suite |
| `npm run setup` | First-time local setup with Docker PostgreSQL |
| `npm run vercel:setup` | Supabase + Vercel environment setup |

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Prisma · PostgreSQL · Supabase Auth · TanStack Query · Zod · Serwist (PWA)

## Deploy

```bash
cd rimev
# Vercel Root Directory must be set to "rimev"
npx vercel --prod
```

Full guide: [docs/DEPLOY-VERCEL.md](./docs/DEPLOY-VERCEL.md)
