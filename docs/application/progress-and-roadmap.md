# Progress and Roadmap

**Last updated:** November 2026 — **v1.10.0** (iOS PWA & AI Generation Baseline)\
**Versioning:** [release-versioning.md](./release-versioning.md) — SemVer; every `main` merge = new version  
**Policy:** Plan features by target release. Implement after you approve. Publish release notes only when you ask.

---

## Release map

| Version | Status | Scope | Roadmap |
|---------|--------|-------|---------|
| **v1.0.0** | ✅ Published | Core app + deploy | Phases 0–12 |
| **v1.1.0** | ✅ Published | Public decks & Explore | Phase 8+ |
| **v1.2.0** | ✅ Published | Usernames, username login, dark default | Identity |
| **v1.2.1** | ✅ Published | Settings hub, auth/email fixes | UX |
| **v1.3.0** | ✅ Published | Import public decks, feedback | Sharing |
| **v1.4.0** | ✅ Published | Practice mode, Daily Review split | Learning modes |
| **v1.5.0** | ✅ Published | Deck/lesson rename, import UX & reliability | Phase A (partial) |
| **v1.6.0** | ✅ Published | Guest mode, public browse without login | Access |
| **v1.6.1** | ✅ Published | Touch UX, lesson navigation, sign-out redirect | UX polish |
| **v1.7.0** | ✅ Published | Swipe deck UX, endless guest practice loop | UX |
| **v1.7.1** | ✅ Published | Single-card guest practice fix | UX reliability |
| **v1.7.2** | ✅ Published | Desktop shell, practice viewer width, Explore UX polish | UX polish |
| **v1.7.3** | ✅ Published | Study viewer gesture & rating fixes (Fix #3) | UX polish |
| **v1.7.4** | ✅ Published | Labeled nav & guest escape hatch (Fix #5) | UX polish |
| **v1.8.0** | ✅ Published | Unified swipe UI for practice & review | UX |
| **v1.8.1** | ✅ Published | UI polish batch (header, focus, title edit, guest copy) | UX polish |
| **v1.9.x** | ✅ Published | AI Learning Engine (SSE streaming, provider cascade, context memory, tutor notes) | AI Mode |
| **v1.10.0** | ✅ Published | iOS PWA fixes (static manifest, Apple meta tags, middleware exempt) | Mobile PWA |
| **v1.11.0** | Planned | Deck description/color edit, lesson reorder, direct card UI on deck page | Phase A (completion) |
| **v1.12.0** | Planned | JSON export (deck + library) | Phase B |
| **v1.13.0** | Planned | Detailed study statistics & visual charts | Phase C |
| **v2.0.0** | Planned | Tags taxonomy, filtering, and tag management | Phase D |
| **v2.1.0** | Planned | Rich media cards (image and audio via Supabase Storage) | Phase E |
| **v2.2.0** | Planned | CSV import & custom review filters | Phase F + G |
| **v3.0.0** | Future | Platform (roles/admin, native clients, offline sync queue) | Phase H / I |

Release notes: [docs/releases/](../releases/) · Changelog: [CHANGELOG.md](../../CHANGELOG.md)

---

## v1.0.0 Summary

Rimev **v1.0.0** is **stable and deployed**. The personal learning loop works:

```text
Import or create content → Study lessons → Daily review → Track on dashboard
```

| Area | v1.0.0 Status |
|------|---------------|
| Auth (Supabase) | ✅ Shipped |
| Dashboard | ✅ Shipped |
| Decks | ✅ Shipped |
| Lessons + study viewer | ✅ Shipped |
| Review + scheduler | ✅ Shipped |
| Search | ✅ Shipped |
| Settings + import | ✅ Shipped |
| Mobile shell | ✅ Shipped |
| Vercel + Supabase deploy | ✅ Shipped |
| Performance (mobile) | ✅ Optimized |

**Release notes:** [v1.0.0.md](../releases/v1.0.0.md) (**Published**) · [v1-release.md](./v1-release.md) (snapshot)

---

## v1.1.0 Summary

Rimev **v1.1.0** adds **public deck publishing** and **Explore**:

```text
Create deck → Set Public → Appears in Explore for others → Browse read-only
```

| Area | v1.1.0 Status |
|------|---------------|
| Public/private deck toggle | ✅ Shipped |
| Explore page (library search + public decks) | ✅ Shipped |
| Read-only public deck browsing | ✅ Shipped |
| App version in Settings | ✅ Shipped |

**Release notes:** [v1.1.0.md](../releases/v1.1.0.md) (**Published**)

---

## v1.2.0 Summary

Rimev **v1.2.0** adds **identity and appearance** improvements:

```text
Sign up → Get random username → Customize in Settings → Shown on public decks
```

| Area | v1.2.0 Status |
|------|---------------|
| Unique usernames (auto + editable) | ✅ Shipped |
| Sign in with username | ✅ Shipped |
| `@username` on public decks in Explore | ✅ Shipped |
| Dark mode default | ✅ Shipped |

**Release notes:** [v1.2.0.md](../releases/v1.2.0.md) (**Published**)

---

## v1.3.0 Summary

Rimev **v1.3.0** improves **sharing and feedback**:

```text
Explore public deck → Add to library → Study with your own progress → Author credited
```

| Area | v1.3.0 Status |
|------|---------------|
| Import public decks to library | ✅ Shipped |
| Author attribution on imported decks | ✅ Shipped |
| Feedback (suggestions & bugs) | ✅ Shipped |
| Username under Account settings | ✅ Shipped |

**Release notes:** [v1.3.0.md](../releases/v1.3.0.md) (**Published**)

---

## v1.4.0 Summary

Rimev **v1.4.0** splits learning into **Practice** and **Daily Review**:

```text
Open app → Practice card immediately → Rate 1–5 → Card re-queues adaptively
Dashboard → Daily Review (due cards only) → Updates SRS schedule
```

| Area | v1.4.0 Status |
|------|---------------|
| Practice mode (endless, queue-based) | ✅ Shipped |
| PracticeScheduler (client-side) | ✅ Shipped |
| DailyReviewScheduler (SRS, unchanged behavior) | ✅ Shipped |
| App opens to practice card | ✅ Shipped |
| Nav: Dashboard → Practice → Decks → Explore | ✅ Shipped |
| Recent-deck practice pool | ✅ Shipped |
| Deck practice (all cards, any lesson) | ✅ Shipped |
| Lesson practice (lesson-scoped only) | ✅ Shipped |
| Imported deck visibility lock | ✅ Shipped |
| Explore shows author's own public decks | ✅ Shipped |
| Rating button color accents | ✅ Shipped |

**Release notes:** [v1.4.0.md](../releases/v1.4.0.md) (**Published**)

---

## v1.5.0 Summary

Rimev **v1.5.0** adds **content editing** and **import reliability**:

```text
Deck detail → Pencil icon → Rename deck or lesson
Settings → Import → Upload file → Import JSON (confirm)
```

| Area | v1.5.0 Status |
|------|---------------|
| Deck title edit (pencil on deck page) | ✅ Shipped |
| Lesson title edit (pencil on lesson list) | ✅ Shipped |
| Import requires Import JSON click (no auto-import on upload) | ✅ Shipped |
| Large deck import batched per lesson | ✅ Shipped |
| Import cache invalidation (deck detail + lessons) | ✅ Shipped |
| Faster app load (practice prefetch removed) | ✅ Shipped |
| Sample Telugu & Kannada deck JSON in repo | ✅ Shipped |

**Release notes:** [v1.5.0.md](../releases/v1.5.0.md) (**Published**)

---

## Completed Phases (v1.0.0)

### Phase 0 — Architecture

- API-first, feature-based structure documented
- Pure scheduler isolated from UI/DB
- Docs in `docs/architecture/`

### Phase 1 — Scaffold

- Next.js 15, Prisma, PostgreSQL, seed data, Vitest scheduler tests

### Phase 2 — Architecture v2 migration

- `app/`, `features/`, `lib/`, `types/` layout
- All business logic behind `/api` route handlers

### Phase 3 — Decks

- Full deck API CRUD
- Deck list, create, delete, detail pages

### Phase 4 — Lessons

- Lesson API CRUD
- Lesson list, create, delete on deck detail
- Tap-to-study with `StudyCardViewer` (swipe, reverse mode)

### Phase 5 — Cards (backend)

- Card API CRUD with scheduling state on create
- Card components exist; not mounted on deck page in v1

### Phase 6 — Review

- Due queue API, submit review API
- Full-screen review UI with 1–5 ratings
- `SimpleIntervalAlgorithm` (`simple-v1`)
- Optimistic card advance for mobile UX

### Phase 7 — Dashboard

- Daily summary: due, reviewed, streak, totals
- Recent decks with due badges
- Review CTA

### Phase 8 — Search

- Search API across decks, lessons, cards
- Grouped results UI

### Phase 9 — Settings + Import

- Theme toggle (light/dark)
- JSON deck import (file + paste)
- Create deck, account sign-out, about

### Phase 10 — Auth

- Supabase email/password login and signup
- Middleware session protection
- Prisma user sync on auth callback
- Mock user for local dev without Supabase

### Phase 11 — Mobile shell + branding

- Floating bottom nav (Dashboard, Practice, Decks, Explore)
- Desktop gate ("mobile-first" message)
- Rimev branding and theme system

### Phase 12 — Deploy + performance

- Vercel production (`rimev.vercel.app`)
- Supabase Postgres + Auth (`ap-south-1`)
- Vercel function region `bom1` (Mumbai)
- Query prefetching, optimistic review, DB query optimizations

---

## v1 Gaps (known, acceptable for baseline)

These exist in code partially but are **not required for v1 stability**:

| Gap | What exists | What's missing |
|-----|-------------|----------------|
| Deck edit (full) | Title edit in UI; `PATCH` API for description/color | Description, color, subject edit UI |
| Lesson edit/reorder | Title edit in UI; `PATCH` API | Drag reorder UI |
| Card management | Full API + forms in `features/cards/` | `CardsSection` on deck page |
| Tags | Prisma models + import | Tag API routes + UI |
| Export | — | API + UI |
| Statistics | Dashboard counts | Charts page `/statistics` |
| Media | Schema fields | Upload UI |
| Review sessions page | DB model | `/review/[sessionId]` route |

---

## Upcoming releases (for your review)

> Map features to **target versions** below. Adjust scope or merge versions before approving work.  
> See [release-versioning.md](./release-versioning.md) for MAJOR/MINOR/PATCH rules.

### v1.11.0 — Phase A (continued): Remaining content editing & direct card UI

**Goal:** Complete content editing without re-importing JSON.

| Item | Effort | Value |
|------|--------|-------|
| Deck edit (description, subject, color) | Small | High |
| Lesson reorder (drag or up/down) | Medium | Medium |
| Mount `CardsSection` on deck detail | Medium | High |
| Inline card create/edit/delete on deck page | Medium | High |

**Depends on:** v1.5.0 title editing and `src/features/cards/` component suite (shipped).

---

### v1.12.0 — Phase B: Export

**Goal:** Portable backup and sharing prep (personal use).

| Item | Effort | Value |
|------|--------|-------|
| `GET /api/decks/:id/export` — JSON | Small | High |
| Export all decks | Medium | Medium |
| Future `.rimev` package format | Large | Low (v2+) |

**Depends on:** Nothing.

---

### v1.13.0 — Phase C: Statistics and progress

**Goal:** Visual learning history beyond dashboard counts.

| Item | Effort | Value |
|------|--------|-------|
| `/statistics` page | Medium | High |
| Reviews per day chart (7/30 days) | Medium | High |
| Mature vs learning card breakdown | Small | Medium |
| Deck-level progress | Medium | Medium |
| Review heatmap (GitHub-style) | Large | Low |

**Depends on:** Review logs (already populated in v1).

---

### v2.0.0 — Phase D: Tags

**Goal:** Organize and filter content.

| Item | Effort | Value |
|------|--------|-------|
| Tag CRUD API | Small | Medium |
| Tag picker on deck/card forms | Medium | Medium |
| Filter decks by tag | Medium | Medium |
| Tag display on deck list | Small | Low |

**Depends on:** Prisma schema (exists).

---

### v2.1.0 — Phase E: Rich cards (media)

**Goal:** Image and audio on flashcards.

| Item | Effort | Value |
|------|--------|-------|
| Supabase Storage bucket + upload API | Medium | High |
| Image display in `StudyCardViewer` | Small | High |
| Audio playback on cards | Medium | Medium |
| Camera capture on mobile | Large | Medium |

**Depends on:** Supabase Storage setup.

---

### v2.2.0 — Phase F + G: Import expansion & review enhancements

**Goal:** More import options and flexible review.

| Item | Effort | Value |
|------|--------|-------|
| CSV import (front, back columns) | Medium | High |
| Filter review by deck | Small | Medium |
| "Cram" mode (ignore schedule) | Medium | Medium |
| Anki `.apkg` import | Large | High |
| Custom daily review limit | Small | Low |
| Leech detection (cards failed N times) | Medium | Medium |
| Markdown import | Medium | Low |

**Depends on:** Card UI on deck page.

---

### v3.0.0 — Phase H + I: Platform (future)

**Goal:** Admin tools, roles, and native mobile clients.

| Item | Effort | Value |
|------|--------|-------|
| Role field on User (admin/user) | Small | Low |
| OpenAPI spec from existing routes | Medium | High |
| Admin: seed sample decks | Medium | Low |
| React Native or Flutter client | Very large | High |
| Offline review queue | Very large | High |
| Public deck marketplace | Large | Out of scope |

**Depends on:** Product decision on multi-user and native apps.

---

## Suggested priority (by release)

1. **v1.11.0** — Remaining content editing (deck fields, card UI on deck page)
2. **v1.12.0** — Export
3. **v1.13.0** — Statistics
4. **v2.0.0** — Tags
5. **v2.1.0+** — Media, CSV import, platform — as needed

---

## How to Request Work

When ready, tell the agent something like:

- "Build v1.1.0 — deck edit and card UI"
- "Skip v1.3.0 for now; ship v1.2.0 export only"
- "Publish release notes for v1.0.0"

The agent drafts release docs on `main` merges; **publishes only when you ask**.

---

## Doc Maintenance

Update this file when:

- A release ships (move to Completed, add release notes)
- You retarget a feature to a different version
- Infrastructure changes

Related docs:

- [release-versioning.md](./release-versioning.md)
- [docs/releases/](../releases/)
- [CHANGELOG.md](../../CHANGELOG.md)
- [v1-release.md](./v1-release.md)
- [layman-guide.md](./layman-guide.md)
- [technical-reference.md](./technical-reference.md)
