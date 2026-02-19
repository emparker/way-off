# Way Off — Development Roadmap & Status Tracker

> Living document. Update checkboxes and status as work progresses.

---

## Current Status

**Phase 1 (Core Game Loop): COMPLETE**
**Phase 2 (Persistence & Bug Fixes): COMPLETE**
**Phase 2.5 (Per-Guess Timer): COMPLETE**
**Phase 4 (Polish & Mobile UX): COMPLETE**
**Next up: Phase 3A (Deploy) → Soft Launch → Phase 3B (MongoDB)**

Core game loop with cookie persistence, SSR, 10-second per-guess timer, ReadyScreen gate, countdown timer, accessibility, and animations. Hardcoded questions — no MongoDB yet.

### What's Working
- Full play → feedback → reveal → share flow
- 10-second per-guess countdown timer with color transitions and danger-phase glow
- "I'm Ready" gate screen with pulsing CTA
- Timeout handling (⏰ in guess history with red tint + empty progress bar, share text, emoji trail)
- Cookie persistence across page reloads (including timeout sentinel `-1`)
- Server-side question rendering (`force-dynamic`)
- Dev-mode `?date=` query param for testing any question
- Feedback algorithm (log-scale distance with imperative coaching labels)
- Shorthand input parsing (5k, 2m, 1.5b) — desktop keyboard
- Magnitude buttons (Thousand / Million / Billion / Trillion) — 2x2 grid, mobile-friendly, no keyboard switching
- Spoiler-free emoji share text with avg response time (preview collapsed by default)
- All animations (fadeIn, fadeSlideIn, popIn, slamIn, clueIn, shake, pulseGlow)
- `prefers-reduced-motion` media query for accessibility
- "Come back tomorrow" countdown timer on reveal screen (UTC-based)
- Native share sheet (`navigator.share`) with clipboard fallback
- Progress bar fill animation (animates from 0 on mount)
- Styled Unicode directional arrows (↑↓) replacing emoji for cross-platform consistency
- `tabular-nums` on all numeric displays (guess rows, reveal number, countdown)
- Rotating loss messages for personality
- Reveal number colored green on solve, tighter tracking at display size
- Full accessibility: ARIA live regions, labels, focus management, semantic HTML
- Safe area insets, viewport zoom prevention, mobile scroll-into-view
- Font: Space Grotesk (distinctive numerals, geometric personality)
- Build passes cleanly (~6.7kB page + 87kB shared JS)

### What's Broken or Missing
- **Answer exposed in API response** — acceptable for MVP, documented tradeoff
- **Gradient utilities not extracted** — low priority, deferred
- **GuessTimer `onTimeout` callback in useEffect deps** — can theoretically reset timer mid-countdown if parent re-renders with new callback reference. Low probability but should be refactored to use a ref pattern.

---

## Launch Strategy

**Soft launch first, public launch later.**

The original Phase 3 was split: deployment (3A) was extracted and moved ahead of UX polish (Phase 4). MongoDB (3B) was deferred — 30 hardcoded questions provide sufficient runway for soft launch validation.

### Rationale
- 30 hardcoded questions = 30-day content runway, no DB needed yet
- UX polish (Phase 4) has higher user impact than infrastructure (Phase 3B)
- Soft launch audience (friends/family) will forgive a `.vercel.app` URL but not a janky mobile experience
- "Come back tomorrow" countdown and `navigator.share()` are the two highest-impact missing features for retention and virality

### Execution Order

| Step | Phase | Milestone |
|------|-------|-----------|
| 1 | **3A — Deploy** | Live URL on Vercel, real-device testing |
| 2 | **4 — Polish & Mobile UX** | Countdown timer, native share, accessibility, mobile fixes |
| 3 | **Soft Launch** | Share with friends & family (~20-50 people), gather feedback |
| 4 | **3B — MongoDB** | Real database, caching, rate limiting, content scalability |
| 5 | **5 — Stickiness** | Stats modal, OG images, streaks, PWA manifest |
| 6 | **Public Launch** | Product Hunt, social media, full infrastructure in place |

### Soft Launch vs. Public Launch
- **Soft launch** = controlled distribution. You send the link to people you know. The app is technically accessible to anyone with the URL, but not discoverable (no SEO pages, no OG images, no public promotion).
- **Public launch** = active promotion. Product Hunt, social posts, press. First impressions are final — the app must be polished, infrastructure must be solid, and link previews must be compelling.

### Content Runway
29 hardcoded questions (one quintillion-scale question removed — see Content Decisions below). MongoDB (Phase 3B) and the content pipeline (Phase 6) must be operational before day ~20 to ensure no gaps. Monitor this actively after soft launch.

### Detailed TODO Plans
- [`docs/TODOs/phase-3a-deploy-to-vercel.md`](TODOs/phase-3a-deploy-to-vercel.md)
- [`docs/TODOs/phase-4-polish-and-mobile-ux.md`](TODOs/phase-4-polish-and-mobile-ux.md)
- [`docs/TODOs/phase-3b-mongodb-and-real-content.md`](TODOs/phase-3b-mongodb-and-real-content.md)

---

## Architecture Decisions (Locked In)

These decisions were evaluated by architecture, frontend, and backend specialists. Do not revisit unless there's a strong reason.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Timezone | **UTC everywhere** | Simpler and consistent. Server already uses UTC. All question dates are UTC. A user in Hawaii at 10pm sees "tomorrow's" question — this is acceptable and standard for daily games. |
| Cookie vs localStorage | **Cookies only** | Per CLAUDE.md. Single JSON cookie (`way-off_state`), ~200 bytes. Store raw guess values, recompute feedback on hydration. |
| Answer delivery | **Send answer with question** | MVP tradeoff. Client-side only. Determined cheaters will always find it. No prizes or leaderboard to protect. Harden in a later phase if needed. |
| Mobile number input | **Magnitude buttons + decimal keypad** | `inputMode="decimal"` keeps the numeric keypad up on mobile. Tap-to-toggle Thousand/Million/Billion/Trillion buttons let players express big numbers without typing zeros or switching keyboards. Full words (not K/M/B) — user testing showed single letters were confused with units (kilometers, miles). Desktop shorthand (5k, 2m) still works via `parseInput`. |
| Answer range | **Cap at trillions** | Questions with answers above trillions (e.g. quintillions) are excluded — they're nearly impossible to input on mobile even with magnitude buttons, and the numbers lose intuitive meaning. The Trillion button is the ceiling. |
| Content strategy | **Append-only, quarterly batches** | Never re-seed or mutate existing questions. Add new questions with future dates. Target 365 questions for Year 1, then quarterly batch authoring (90 questions/quarter) with AI-assisted generation and manual curation. |
| Server vs client rendering | **Server Component for page, client for GameBoard** | Question data is the same for all users per day — perfect SSR candidate. Eliminates loading spinner, improves LCP, reduces client JS. |
| Session model | **Skip for MVP** | All state in cookies. Server-side sessions add write overhead with no benefit until aggregate analytics ("closer than 84% of players") in Phase 6. |
| MongoDB pool size | **maxPoolSize: 5** | Low pool for Vercel serverless. Cached connection singleton on `global` survives across invocations in the same container. |
| Seed script pattern | **Upsert by date** | `findOneAndUpdate` with `upsert: true`. Idempotent — safe to re-run. Appending new questions won't affect existing ones. |
| Rate limiting | **Simple in-memory per IP** | 30 req/min. Resets on container recycle. Prevents basic abuse without adding infrastructure. |

---

## Cookie Schema

Compact JSON stored in a single `way-off_state` cookie:

```typescript
interface CookieGameState {
  v: string;           // visitor UUID (generated once, persists forever)
  d: string;           // date "2026-02-09" — which question this state is for
  g: number[];         // raw guess values [5000, 20, 35]
  r: "p" | "w" | "l"; // playing / win / loss
  sk: number;          // current streak
  sl: number;          // longest streak
  gp: number;          // games played
  ld: string;          // last date completed (streak continuity check)
}
```

Single-letter keys keep size under 250 bytes. Feedback is derived data — recompute from `getFeedback(guess, answer)` on hydration. A value of `-1` in the `g` array represents a timed-out guess.

### Hydration States

| Cookie State | Action |
|-------------|--------|
| No cookie (first visit) | Generate visitor UUID, start fresh game |
| `d` matches today, `r` is `"p"` | Restore mid-game: recompute feedback for stored guesses |
| `d` matches today, `r` is `"w"` or `"l"` | Show completed game / reveal screen |
| `ld` was yesterday | New day, streak continues. Clear guesses, start fresh |
| `ld` older than yesterday | New day, streak broken. Reset `sk` to 0, start fresh |

---

## Phased Roadmap

### Phase 2: Persistence & Bug Fixes
> Goal: Make the game actually work across page reloads. Fix visual bugs.

- [x] **2A. Fix progress bar visibility** — `components/GuessRow.tsx:11` change `bg-bg-secondary` → `bg-bg-primary` on the progress bar track
- [x] **2A. Fix GuessRow border** — `components/GuessRow.tsx:33` add `border border-solid` class or use Tailwind border utilities alongside inline color
- [x] **2B. Create `lib/cookies.ts`** — `getGameState()`, `setGameState()`, `clearGameState()` with compact JSON cookie
- [x] **2B. Create `hooks/usePersistedGame.ts`** — single source of truth for game state, handles all 5 hydration states, writes cookie on every guess and game-over
- [x] **2B. Refactor `GameBoard.tsx`** — thin presenter that receives state + callbacks from the hook
- [x] **2C. Convert `app/page.tsx` to Server Component** — fetch question server-side, pass to client GameBoard, eliminate loading spinner
- [x] **2C. Removed `hooks/useGameState.ts`** — question fetching moved to server component, replaced with `lib/questions.ts`

**Done when:** Page refresh mid-game restores exact state. Completed game stays completed on reload. Next-day visit starts fresh game.

---

### Phase 3A: Deploy to Vercel (Hardcoded Questions)
> Goal: Get a live URL for real-device testing. No MongoDB needed.

Extracted from the original Phase 3. Deployment was decoupled from MongoDB because 30 hardcoded questions are sufficient for soft launch.

- [x] **Verify production build locally** — `npm run build && npm run start`
- [x] **Create Vercel project** — connected GitHub repo, Hobby plan, no env vars
- [x] **Deploy to Vercel** — live URL (rename in progress)
- [x] **Production smoke test** — page loads, API returns valid JSON, no errors
- [ ] **Test on real mobile devices** — iOS Safari, Chrome Android

**Done when:** Game runs on a live `.vercel.app` URL and works on real phones.

See [`docs/TODOs/phase-3a-deploy-to-vercel.md`](TODOs/phase-3a-deploy-to-vercel.md) for full implementation details.

---

### Phase 4: Polish & Mobile UX
> Goal: Go from "works" to "feels great on a phone." Last phase before soft launch.

Moved ahead of Phase 3B (MongoDB). All work is client-side — no infrastructure dependencies.

**High impact:**
- [x] Add "come back tomorrow" countdown timer on RevealScreen
- [x] Web Share API on mobile (`navigator.share`) with clipboard fallback *(done in Phase 2)*
- [x] Fix progress bar fill animation — mount at `width: 0`, animate to target via `useEffect`
- [x] Add `fadeSlideIn` entrance animation on "See the Answer" button
- [x] Scroll input into view after each guess on mobile *(done in Phase 2)*
- [x] Add `navigator.clipboard` error handling with try/catch *(done in Phase 2)*

**Accessibility:**
- [x] `aria-live="polite"` + `role="log"` on guess history container
- [x] `aria-label="Enter your guess"` on input field
- [x] `role="img"` + `aria-label` on all emoji spans (feedback + trail)
- [x] Focus management: move focus to heading on play → reveal transition
- [x] Change `Header.tsx` wrapper from `<div>` to `<header>`
- [x] Add `type="button"` to all non-form buttons *(already present)*
- [x] Add `role="progressbar"` + `aria-valuenow` to ProgressBar

**Mobile polish:**
- [x] Safe-area inset padding for iPhone home indicator (`env(safe-area-inset-bottom)`) *(done in Phase 2)*
- [x] Test `inputMode="decimal"` vs `"text"` — using `decimal` *(done in Phase 2)*
- [x] Viewport `user-scalable=no` to prevent accidental zoom *(done in Phase 2)*
- [ ] Extract repeated gradient `background` styles to Tailwind utilities *(deferred — low impact)*

**Done when:** Game feels native-app smooth on iOS Safari and Chrome Android. Screen reader can play the full game.

See [`docs/TODOs/phase-4-polish-and-mobile-ux.md`](TODOs/phase-4-polish-and-mobile-ux.md) for full implementation details.

---

### Soft Launch Checkpoint
> Gate: Do not proceed to public launch until soft launch feedback is incorporated.

- [ ] Share URL with friends & family (~20-50 people)
- [ ] Collect feedback for at least 1 week of daily play
- [ ] Key signals to watch: Do they share? Do they come back day 2? What confuses them?
- [ ] Fix critical issues surfaced by real users
- [ ] Proceed to Phase 3B

---

### Phase 3B: MongoDB & Real Content
> Goal: Migrate from hardcoded questions to MongoDB. Add caching and rate limiting.

Deferred from the original Phase 3. Not needed until content runway (~30 days from deploy) starts running low.

- [ ] **Install mongoose** — add to dependencies
- [ ] **Create `lib/db.ts`** — connection singleton with global caching for serverless
- [ ] **Create `lib/models/Question.ts`** — Mongoose schema with `{ date: 1 }` unique index, `{ questionNumber: 1 }` unique index
- [ ] **Create `scripts/seed-questions.ts`** — upsert by date, validates no duplicate dates, sequential question numbers
- [ ] **Add `tsx` dev dependency** and `"seed"` script to package.json
- [ ] **Seed 30 questions** — run against Atlas cluster, verify in Compass
- [ ] **Refactor `app/api/question/today/route.ts`** — query MongoDB instead of hardcoded array, add fallback for missing dates
- [ ] **Add Cache-Control header** — cache until midnight UTC
- [ ] **Add rate limiter** — 30 req/min per IP, in-memory Map
- [ ] **Add `MONGODB_URI` env var** to Vercel dashboard
- [ ] **Redeploy and verify** — question delivery from DB, cache headers, rate limiting

**Done when:** Game serves questions from MongoDB with caching and rate limiting. Hardcoded fallback still works if DB is down.

See [`docs/TODOs/phase-3b-mongodb-and-real-content.md`](TODOs/phase-3b-mongodb-and-real-content.md) for full implementation details and patterns.

#### Implementation Patterns (get these wrong and things break)

**MongoDB connection singleton (`lib/db.ts`)**
Vercel serverless spins up many containers. Without caching the connection on `global`, each invocation opens a new connection and you'll exhaust Atlas connection limits within minutes under any real traffic.
```typescript
// Cache on global so it survives across invocations in the same container
declare global { var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined; }
// Key settings: maxPoolSize: 5 (low for serverless), bufferCommands: false (fail fast, don't queue)
```

**Cache-Control header on API route**
Without this, Vercel's CDN or the browser can serve yesterday's question past midnight. Calculate seconds until midnight UTC and set both `max-age` and `s-maxage`:
```typescript
const now = new Date();
const midnight = new Date(now);
midnight.setUTCHours(24, 0, 0, 0);
const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);
res.headers.set("Cache-Control", `public, max-age=${ttl}, s-maxage=${ttl}`);
```

**Rate limiter**
Simple in-memory `Map<string, { count: number; resetAt: number }>` keyed by IP from `x-forwarded-for`. Resets when the serverless container recycles — that's fine for MVP. 30 req/min per IP is generous enough to never affect real users.

**Seed script upsert pattern**
Use `findOneAndUpdate({ date: q.date }, { $set: q }, { upsert: true })` — not `insertMany`. This makes the script idempotent: run it twice and nothing breaks. Run it after editing a question and the update takes effect. `insertMany` fails atomically on the first duplicate. The script must also validate before inserting:
- All dates are unique (no two questions on the same day)
- Dates are contiguous from launch day (no gaps that cause 404s)
- `questionNumber` values are sequential (1 through 30)

---

### Phase 5: Stickiness
> Goal: Give players a reason to come back every day.

- [ ] **Streak tracking** — extend cookie with `sk`, `sl`, `gp` (may already be wired in Phase 2B)
- [ ] **Stats modal** (`components/StatsModal.tsx`) — games played, win %, guess distribution chart
- [ ] **Daily reset with countdown** — timer on completion screen (may already exist from Phase 4)
- [ ] **OG meta tags** — expand `metadata` in `layout.tsx` with `openGraph.images`
- [ ] **Create `public/og-image.png`** — preview image for link shares
- [ ] **Favicon** — `public/favicon.ico`
- [ ] **PWA manifest** — `public/manifest.json` + meta tags in layout

**Done when:** Players see streaks, stats, and a countdown. Shared links have a rich preview card.

---

### Phase 6: Content Pipeline & Growth
> Goal: 365-day question bank for Year 1, then sustainable content for the long term.

**Year 1 target: 365 questions.** Currently at 29. Priority is reaching 365 before the runway runs out.

**Immediate (before day ~20):**
- [ ] AI-assisted question generation using Claude API — bulk-generate candidates, manually curate/edit/approve
- [ ] Question review workflow (JSON file reviewed in PR before seeding)
- [ ] Seed database to 365 questions (full year of daily content)
- [ ] 30-day content buffer monitoring (alert when runway drops below 30)

**After Year 1 bank is seeded:**
- [ ] Themed day categories (Time Tuesday, Space Sunday, etc.)
- [ ] Archive page (`app/archive/page.tsx`) — past questions, locked until played
- [ ] SEO blog pages for viral questions (`app/q/[id]/page.tsx`)
- [ ] Social proof on reveal ("You're closer than 84% of players") — requires Session model
- [ ] PWA offline support + add-to-homescreen

**Long-term content strategy (Year 2+):**
- **Append, never re-seed.** New questions are added to the database with future dates. Existing questions and their dates are immutable once seeded — players may reference past games.
- **Quarterly batch authoring.** Every ~3 months, generate and curate 90 new questions to cover the next quarter. Aim to always have a 90-day buffer ahead of the current date.
- **AI-assisted pipeline.** Use an LLM to generate 500+ candidate questions per session. Manually curate for the "wait, WHAT?" test, verify sources, and approve. Realistically produces 90 vetted questions per weekend session.
- **Community submissions (when traction warrants).** Let users submit question ideas. Moderate and quality-gate before seeding. This is how trivia games scale indefinitely.
- **Content is infinite.** The universe of numeric facts spans human body, space, money/economics, nature, history, food, technology, geography, and more. 1,000+ unique high-quality questions is achievable without stretching. Content quantity is not a risk; content quality is the bottleneck to protect.

**Done when:** 365 questions are seeded. Content pipeline can produce a quarter's worth of questions in a single session.

---

## What Makes This App Succeed

These are the non-negotiable principles. Every feature decision should pass through these filters.

### 1. The Share Output Is Everything
The spoiler-free emoji grid is the single most important feature. It is how every new player discovers the game. Design every interaction around making sharing effortless and compelling. If a feature makes sharing harder or less fun, cut it.

### 2. The Reveal Moment Is the Dopamine Hit
The animated big number + "wait, WHAT?" explanation is why people come back. Protect this moment. The transition from guessing to reveal should feel like unwrapping a gift. Never skip the animation. Never bury the explanation.

### 3. Daily Scarcity Creates Habit
One question per day. No exceptions. No "play more" upsell. Scarcity is the retention mechanic. The countdown timer after completion is the hook that brings players back tomorrow. Without it, there's no reason to return.

### 4. Mobile-First, Phone-Native Feel
80%+ of viral game traffic comes from phones via social media links. If it doesn't feel like a native app on an iPhone, it fails. Touch targets, scroll behavior, safe areas, keyboard experience — these matter more than desktop polish.

### 5. Zero Friction, Zero Explanation
No login. No tutorial. No onboarding. If a new player can't figure out the game in 5 seconds from a shared link, something is wrong. The UI must be self-evident.

### 6. Content Quality Over Quantity
Every question must pass the "wait, WHAT?" test. A single boring question breaks the daily habit. It's better to have 30 mind-blowing questions than 365 mediocre ones. Quality gate every single question before seeding.

---

## Risk Register

| Risk | Severity | Mitigation | Status |
|------|----------|------------|--------|
| Cookie persistence done wrong forces GameBoard rewrite | **High** | Define cookie schema + hydration flow before coding. Handle all 5 states. | Schema designed above |
| Timezone mismatch between server and client | **High** | UTC everywhere. Server date in API response is canonical. | Decision locked |
| 29-question runway runs out (~1 month) | **Medium** | Start Phase 6 content pipeline before day 20. Monitor buffer. | 29 questions ready |
| Progress bar / border bugs erode perceived quality | **Low** | Fix in Phase 2A before any user testing. | Fixed in Phase 2 |
| `navigator.clipboard` fails in in-app browsers (Instagram, Twitter) | **Medium** | Web Share API fallback on mobile in Phase 4. | Not yet implemented |
| MongoDB cold starts on Vercel (500-1500ms first request) | **Low** | Connection singleton caches across invocations. Cron ping if needed. | Architecture designed |
| Answer visible in DevTools / network tab | **Low** | Accepted MVP tradeoff. No prizes to protect. Harden later if needed. | Decision locked |
| No error boundaries — component crash = white screen | **Medium** | Add React error boundary around GameBoard in Phase 4. | Not yet implemented |

---

## File Inventory

### Exists (Through Phase 2.5)
```
app/layout.tsx, page.tsx, globals.css
app/api/question/today/route.ts
components/GameBoard.tsx, QuestionDisplay.tsx, GuessInput.tsx
components/GuessHistory.tsx, GuessRow.tsx, RevealScreen.tsx
components/GuessTimer.tsx, ReadyScreen.tsx
components/ShareButton.tsx, Header.tsx
lib/game-logic.ts, share.ts, cookies.ts, questions.ts
hooks/usePersistedGame.ts
types/index.ts
docs/claude-project-knowledge.md, docs/game-prototype.tsx, docs/roadmap.md
tailwind.config.ts, tsconfig.json, postcss.config.js
next.config.js, .eslintrc.json, package.json, CLAUDE.md
```

### To Be Created
```
Phase 3A: (no new files — deploy existing build)
Phase 4:  (modifications to existing files only)
Phase 3B: lib/db.ts, lib/models/Question.ts, scripts/seed-questions.ts, .env.example
Phase 5:  components/StatsModal.tsx, hooks/useStreak.ts, public/og-image.png,
          public/favicon.ico, public/manifest.json
Phase 6:  scripts/generate-questions.ts, app/archive/page.tsx, app/about/page.tsx,
          app/q/[id]/page.tsx, lib/models/Session.ts, app/api/stats/route.ts
```
