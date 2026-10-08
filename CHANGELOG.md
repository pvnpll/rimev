# Changelog

All notable releases of Rimev follow [Semantic Versioning](https://semver.org/) and [release-versioning.md](docs/application/release-versioning.md).

Release notes are **drafted** on each `main` merge; **published** only when explicitly requested.

---

---

## [v1.10.0] — 2026-10-08 (Published)

**iOS PWA Fix** — Move to static manifest and exclude from middleware.

→ [Full release notes](docs/releases/v1.10.0.md)

### Fixed
- Fixed iOS Safari treating the app as a bookmark by using a static `manifest.json` and exempting it from auth middleware.
- Ensured explicit Apple web app meta tags are present in root layout.

## [v1.8.1] — 2026-09-18 (Published)

**UI polish batch** — Viewer header Back + theme toggle together, header loading skeletons, keyboard focus states, 44px title-edit target with retry-safe saves, guest copy and practice landing polish.

→ [Full release notes](docs/releases/v1.8.1.md)

### Changed
- Study viewer header always shows Back + theme toggle; safe truncation
- App header shows skeleton pills while auth loads (no layout shift)
- Deck cards and search rows get visible keyboard focus states
- Title-edit pencil enlarged to 44px; failed saves stay open for retry
- Guest lesson copy and practice landing clarified

---

## [v1.8.0] — 2026-09-18 (Published)

**Unified swipe UI for practice & review** — Signed-in practice and Daily Review use the same swipe cards as guests; ratings footer appears after reveal. Scheduling unchanged.

→ [Full release notes](docs/releases/v1.8.0.md)

### Changed
- Signed-in practice renders the full swipe deck (drag, peek, edge-tap identical to guest mode)
- Daily Review uses swipe cards clamped to the due queue (no endless loop)
- Ratings footer renders in swipe mode; per-mode footer hints; `noLoop`/`hideSwipeHint` viewer props

---

## [v1.7.4] — 2026-09-17 (Published)

**Labeled nav & guest escape hatch** — Bottom nav shows icon + label; every auth wall links back to Explore for guests.

→ [Full release notes](docs/releases/v1.7.4.md)

### Changed
- Floating nav items show icon + text label (was icon-only)
- "Continue as guest" escape hatch on `LoginRequired` cards, login/signup forms, and deck import prompt

---

## [v1.7.3] — 2026-09-14 (Published)

**Study viewer gesture & rating fixes** — Swipe double-commit guard, self-labeled rating buttons, scrollable revealed answers, edge-aware review nav, narrower edge-tap zones.

→ [Full release notes](docs/releases/v1.7.3.md)

### Fixed
- Rapid double-swipe advancing two cards (timer ref + exiting guard + unmount cleanup)
- Rating numbers divorced from 9px labels (single self-labeled grid, screen-reader labels)
- Long revealed answers unscrollable in swipe mode (`touch-pan-y` when revealed)
- Review vertical-swipe hijacking answer scroll (edge-aware navigation)
- Invisible 25% edge-tap zones (narrowed to ~15%, documented in footer, duplicate header counter removed)

---

## [v1.7.2] — 2026-09-14 (Published)

**Desktop shell & Explore UX polish** — App renders on desktop in a centered phone-width column; practice/review viewers match; Explore search no longer autofocuses; whole deck cards tappable.

→ [Full release notes](docs/releases/v1.7.2.md)

### Changed
- Removed mobile-only gate; centered `max-w-md` column on all screens
- Practice/review fullscreen overlays constrained to the column on desktop
- Dashboard 2-column stats, full-width stacked buttons, single-column deck grids
- Explore search inputs no longer autofocus on load
- Entire public deck card is tappable (stretched-link)

### Removed
- Dead `AppSidebar` / `LegacyAppSidebar` components

---

## [v1.7.1] — 2026-09-13 (Published)

**Single-card guest practice fix** — Guest lessons with one card can now reveal their answer as expected.

→ [Full release notes](docs/releases/v1.7.1.md)

### Fixed
- Restored tap-to-reveal for one-card lessons in guest swipe practice

---

## [v1.7.0] — 2026-07-15 (Published)

**Swipe deck UX** — Bumble-style drag cards, corrected swipe direction, and endless loop in guest practice.

→ [Full release notes](docs/releases/v1.7.0.md)

### Added
- Drag-to-swipe card stack with rotation and fly-off animation
- Peek of next/previous card while dragging
- Endless loop through lesson cards in guest swipe practice

### Changed
- Swipe left = next, swipe right = previous
- Snap-back when release is below swipe threshold

---

## [v1.6.1] — 2026-07-15 (Published)

**Touch UX & lesson navigation** — consistent lesson row taps, improved swipe/tap on practice cards, sign out returns to Explore.

→ [Full release notes](docs/releases/v1.6.1.md)

### Changed
- Full lesson row tap target for guest and signed-in users
- Signed-in practice uses tap-to-reveal touch handling (ratings unchanged)
- Guest swipe navigation thresholds and edge tap zones

### Fixed
- Sign out redirects to Explore instead of login

---

## [v1.6.0] — 2026-07-15 (Published)

**Guest mode & public browse** — use Explore and practice public decks without signing in; Daily Review and library require an account.

→ [Full release notes](docs/releases/v1.6.0.md)

### Added
- Guest access to Explore, public decks, and swipe-based practice
- Login prompts for account-only features
- App version footer on Explore page

### Changed
- Home redirect: guests → Explore, signed-in → Practice
- Guest shell header and reduced nav
- Separate practice vs review card viewer modes

### Fixed
- Guest practice session overlay and lesson navigation

---

## [v1.5.0] — 2026-07-15 (Published)

**Content editing & import improvements** — rename decks and lessons; confirm before import; reliable large deck imports.

→ [Full release notes](docs/releases/v1.5.0.md)

### Added
- Deck and lesson title editing with pencil icon on deck detail page
- Sample Kannada and Telugu deck JSON in `content/decks/`

### Changed
- Import requires Import JSON click after file upload (no auto-import)
- Large imports batched per lesson; import API timeout extended
- About and import settings copy updated for Practice + Daily Review

### Fixed
- Slow initial app load (removed global practice prefetch)
- Explore page stuck loading on refetch
- Import cache invalidation for deck detail and lessons after import

---

## [v1.4.0] — 2026-07-15 (Published)

**Practice mode & Daily Review split** — endless adaptive practice as primary experience; SRS daily review secondary.

→ [Full release notes](docs/releases/v1.4.0.md)

### Added
- Practice mode with `PracticeScheduler` (endless, queue-based, no due dates)
- `GET /api/practice/cards` and `PracticeSession` component
- Default practice from recently opened decks (all cards per deck)
- Distinct minimal rating button colors (1–5)

### Changed
- App opens directly into practice with a card loaded
- Nav order: Dashboard → Practice → Decks → Explore
- Lessons use Practice (lesson-scoped); deck practice includes all cards
- Daily Review demoted to dashboard secondary action
- Imported decks cannot change visibility; Explore shows author's own public decks

### Fixed
- Practice session infinite render loop on card load

---

## [v1.3.0] — 2026-07-15 (Published)

**Import public decks & feedback** — add Explore decks to your library, author credits, in-app feedback.

→ [Full release notes](docs/releases/v1.3.0.md)

### Added
- Import public decks to library with saved review progress
- Original author shown on imported decks
- Feedback page for suggestions and bug reports

### Changed
- Username settings merged into Account page

---

## [v1.2.1] — 2026-07-15 (Published)

**Settings hub & auth fixes** — cleaner Settings UI, signup rate-limit fixes, email URL config.

→ [Full release notes](docs/releases/v1.2.1.md)

### Added
- Settings hub with dedicated sub-pages per option
- Auth error messages for rate limits and email confirmation
- Supabase production URL fix script

### Fixed
- Signup double-request rate limiting
- Email confirmation redirect URL configuration

---

## [v1.2.0] — 2026-07-14 (Published)

**Usernames & dark default** — unique usernames, username login, dark mode by default.

→ [Full release notes](docs/releases/v1.2.0.md)

### Added
- Auto-assigned usernames with Settings customization
- `@username` shown on public decks in Explore
- Sign in with email or username

### Changed
- Default theme is now dark for new users

---

## [v1.1.0] — 2026-07-14 (Published)

**Public decks & Explore** — publish decks, discover public content, app version in Settings.

→ [Full release notes](docs/releases/v1.1.0.md)

### Added
- Public/private deck visibility toggle
- Explore page with personal search + public deck discovery
- Read-only browsing of others' public decks
- App version shown in Settings footer

### Changed
- Search nav renamed to Explore (`/explore`)

---

## [v1.0.0] — 2026-07-14 (Published)

**First stable release** — mobile-first spaced repetition app with auth, decks, lessons, review, dashboard, search, import, and production deploy.

→ [Full release notes](docs/releases/v1.0.0.md)

### Added
- Supabase auth, dashboard, decks, lessons, review, search, settings, JSON import
- Mobile shell with floating navigation and study/review viewers
- Vercel + Supabase production deployment

### Changed
- Mobile performance optimizations (optimistic review, prefetch, regional deploy)

---

## Upcoming (proposed — not released)

| Version | Scope |
|---------|--------|
| v1.6.0 | Deck description/color edit, lesson reorder, card UI on deck page |
| v1.7.0 | JSON export |
| v1.8.0 | Statistics page |
| v1.9.0 | Tags |
| v2.0.0 | Media on cards |

See [progress-and-roadmap.md](docs/application/progress-and-roadmap.md) for details.
