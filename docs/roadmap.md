# Guesstimate — Development Roadmap & Status Tracker

> Living document. Update checkboxes and status as work progresses.

---

## Current Status

**Phase 1 (Core Game Loop): COMPLETE**
**Phase 2 (Persistence & Bug Fixes): COMPLETE**

The core game loop compiles, renders, and plays end-to-end with hardcoded questions. No persistence — page refresh resets everything. Two rendering bugs identified. Page is fully client-rendered when the question is a perfect SSR candidate.

### What's Working
- Full play → feedback → reveal → share flow
- Feedback algorithm (exact/hot/warm/cold with directional hints)
- Shorthand input parsing (5k, 2m, 1.5b)
- Number formatting (K/M/B)
- Spoiler-free emoji share text generation
- All 4 animations (fadeIn, fadeSlideIn, popIn, shake)
- Tailwind design system with all color tokens
- Build passes cleanly (3.3kB page + 87kB shared JS)

### What's Broken or Missing
- **No persistence** — refreshing loses all game state (biggest gap)
- **Progress bar invisible** — track color matches row background
- **GuessRow border not rendering** — missing `border-style: solid`
- **No "come back tomorrow"** — dead end after sharing
- **Answer exposed in API response** — acceptable for MVP, documented tradeoff
- **Entire page is client-rendered** — loading spinner instead of instant content
- **No accessibility** — no ARIA labels, no focus management, no screen reader support

---

## Architecture Decisions (Locked In)

These decisions were evaluated by architecture, frontend, and backend specialists. Do not revisit unless there's a strong reason.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Timezone | **UTC everywhere** | Simpler, Wordle precedent. Server already uses UTC. All question dates are UTC. A user in Hawaii at 10pm sees "tomorrow's" question — this is acceptable and matches Wordle behavior. |
| Cookie vs localStorage | **Cookies only** | Per CLAUDE.md. Single JSON cookie (`guesstimate_state`), ~200 bytes. Store raw guess values, recompute feedback on hydration. |
| Answer delivery | **Send answer with question** | MVP tradeoff. Client-side only. Determined cheaters will always find it. No prizes or leaderboard to protect. Harden in a later phase if needed. |
| Server vs client rendering | **Server Component for page, client for GameBoard** | Question data is the same for all users per day — perfect SSR candidate. Eliminates loading spinner, improves LCP, reduces client JS. |
| Session model | **Skip for MVP** | All state in cookies. Server-side sessions add write overhead with no benefit until aggregate analytics ("closer than 84% of players") in Phase 6. |
| MongoDB pool size | **maxPoolSize: 5** | Low pool for Vercel serverless. Cached connection singleton on `global` survives across invocations in the same container. |
| Seed script pattern | **Upsert by date** | `findOneAndUpdate` with `upsert: true`. Idempotent — safe to re-run. Appending new questions won't affect existing ones. |
| Rate limiting | **Simple in-memory per IP** | 30 req/min. Resets on container recycle. Prevents basic abuse without adding infrastructure. |

---

## Cookie Schema

Compact JSON stored in a single `guesstimate_state` cookie:

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

Single-letter keys keep size under 250 bytes. Feedback is derived data — recompute from `getFeedback(guess, answer)` on hydration.

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

### Phase 3: MongoDB & Real Content
> Goal: Connect to real database, seed the 30 questions, deploy.

- [ ] **3A. Install mongoose** — add to dependencies
- [ ] **3A. Create `lib/db.ts`** — connection singleton with global caching for serverless
- [ ] **3A. Create `lib/models/Question.ts`** — Mongoose schema with `{ date: 1 }` unique index, `{ questionNumber: 1 }` unique index
- [ ] **3B. Create `scripts/seed-questions.ts`** — upsert by date, validates no duplicate dates, sequential question numbers
- [ ] **3B. Add `tsx` dev dependency** and `"seed"` script to package.json
- [ ] **3B. Seed 30 questions** — run against Atlas cluster, verify in Compass
- [ ] **3C. Refactor `app/api/question/today/route.ts`** — query MongoDB instead of hardcoded array, add fallback for missing dates
- [ ] **3C. Add Cache-Control header** — cache until midnight UTC
- [ ] **3C. Add rate limiter** — 30 req/min per IP, in-memory Map
- [ ] **3D. Set up Vercel project** — add `MONGODB_URI` env var
- [ ] **3D. Deploy to Vercel** — verify date logic, question delivery, cookie persistence in production

**Done when:** Game runs on a real URL with real questions from MongoDB. 30 days of content seeded.

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

### Phase 4: Polish & Mobile UX
> Goal: Go from "works" to "feels great on a phone."

**High impact:**
- [ ] Add "come back tomorrow" countdown timer on RevealScreen
- [ ] Web Share API on mobile (`navigator.share`) with clipboard fallback
- [ ] Fix progress bar fill animation — mount at `width: 0`, animate to target via `useEffect`
- [ ] Add `fadeSlideIn` entrance animation on "See the Answer" button
- [ ] Scroll input into view after each guess on mobile
- [ ] Add `navigator.clipboard` error handling with try/catch

**Accessibility:**
- [ ] `aria-live="polite"` + `role="log"` on guess history container
- [ ] `aria-label="Enter your guess"` on input field
- [ ] `role="img"` + `aria-label` on all emoji spans (feedback + trail)
- [ ] Focus management: move focus to heading on play → reveal transition
- [ ] Change `Header.tsx` wrapper from `<div>` to `<header>`
- [ ] Add `type="button"` to all non-form buttons
- [ ] Add `role="progressbar"` + `aria-valuenow` to ProgressBar

**Mobile polish:**
- [ ] Safe-area inset padding for iPhone home indicator (`env(safe-area-inset-bottom)`)
- [ ] Test `inputMode="decimal"` vs `"text"` — numeric keypad vs shorthand access tradeoff
- [ ] Viewport `user-scalable=no` to prevent accidental zoom
- [ ] Extract repeated gradient `background` styles to Tailwind utilities

**Done when:** Game feels native-app smooth on iOS Safari and Chrome Android. Screen reader can play the full game.

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
> Goal: Sustainable content and organic growth.

- [ ] AI question generation script (`scripts/generate-questions.ts`) using Claude API
- [ ] Question review workflow (JSON file reviewed in PR before seeding)
- [ ] 30-day content buffer monitoring (alert when runway drops below 30)
- [ ] Themed day categories (Time Tuesday, Space Sunday, etc.)
- [ ] Archive page (`app/archive/page.tsx`) — past questions, locked until played
- [ ] SEO blog pages for viral questions (`app/q/[id]/page.tsx`)
- [ ] Social proof on reveal ("You're closer than 84% of players") — requires Session model
- [ ] PWA offline support + add-to-homescreen

**Done when:** Content pipeline runs autonomously. Archive and SEO pages drive organic traffic.

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
| 30-question runway runs out (~1 month) | **Medium** | Start Phase 6 content pipeline before day 20. Monitor buffer. | 30 questions ready |
| Progress bar / border bugs erode perceived quality | **Low** | Fix in Phase 2A before any user testing. | Identified, not fixed |
| `navigator.clipboard` fails in in-app browsers (Instagram, Twitter) | **Medium** | Web Share API fallback on mobile in Phase 4. | Not yet implemented |
| MongoDB cold starts on Vercel (500-1500ms first request) | **Low** | Connection singleton caches across invocations. Cron ping if needed. | Architecture designed |
| Answer visible in DevTools / network tab | **Low** | Accepted MVP tradeoff. No prizes to protect. Harden later if needed. | Decision locked |
| No error boundaries — component crash = white screen | **Medium** | Add React error boundary around GameBoard in Phase 4. | Not yet implemented |

---

## File Inventory

### Exists (Phase 1 Complete)
```
app/layout.tsx, page.tsx, globals.css
app/api/question/today/route.ts
components/GameBoard.tsx, QuestionDisplay.tsx, GuessInput.tsx
components/GuessHistory.tsx, GuessRow.tsx, RevealScreen.tsx
components/ShareButton.tsx, Header.tsx
lib/game-logic.ts, share.ts
hooks/useGameState.ts
types/index.ts
docs/claude-project-knowledge.md, docs/game-prototype.tsx, docs/roadmap.md
tailwind.config.ts, tsconfig.json, postcss.config.js
next.config.js, .eslintrc.json, package.json, CLAUDE.md
```

### To Be Created
```
Phase 2:  lib/cookies.ts, hooks/usePersistedGame.ts
Phase 3:  lib/db.ts, lib/models/Question.ts, scripts/seed-questions.ts
Phase 4:  (modifications to existing files)
Phase 5:  components/StatsModal.tsx, hooks/useStreak.ts, public/og-image.png,
          public/favicon.ico, public/manifest.json
Phase 6:  scripts/generate-questions.ts, app/archive/page.tsx, app/about/page.tsx,
          app/q/[id]/page.tsx, lib/models/Session.ts, app/api/stats/route.ts
```
