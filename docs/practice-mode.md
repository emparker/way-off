# Practice Mode / Trial Run -- Design Document

> **Status:** Draft -- Pending Review
> **Date:** 2026-02-26
> **Author:** Way Off Team

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [UX Flow](#3-ux-flow)
4. [Entry Point -- Modified ReadyScreen](#4-entry-point--modified-readyscreen)
5. [Practice Question](#5-practice-question)
6. [Practice Board Behavior](#6-practice-board-behavior)
7. [Coaching Cards](#7-coaching-cards)
8. [Practice Reveal Screen](#8-practice-reveal-screen)
9. [Cookie Strategy](#9-cookie-strategy)
10. [Routing](#10-routing)
11. [Mobile Considerations](#11-mobile-considerations)
12. [File Map](#12-file-map)
13. [Implementation Phases](#13-implementation-phases)
14. [Coaching Copy Reference](#14-coaching-copy-reference)
15. [What NOT to Build](#15-what-not-to-build)

---

## 1. Problem Statement

The #1 new-user frustration is the magnitude buttons (Thousand / Million / Billion / Trillion). These buttons are **multipliers** -- tapping "Thousand" multiplies the entered number by 1,000. But users routinely type "1,000" and then tap "Thousand" expecting to confirm their answer, producing 1,000,000 instead. The mental model mismatch causes incorrect guesses and erodes trust in the interface.

Secondary confusion points:

- **The 10-second timer.** New users do not expect a countdown. When it expires, it silently burns one of their 5 guesses (shown as a clock emoji in history). Users feel cheated rather than challenged.
- **Hot/cold feedback.** The emoji + directional arrow system is intuitive once understood, but first-time players often miss the directional hint entirely and do not realize the feedback is telling them which way to adjust.

These three issues share a root cause: Way Off follows the "zero friction, zero explanation" principle (see `CLAUDE.md`), which works well for the core guess-a-number mechanic but breaks down for the magnitude buttons, timer, and feedback system -- mechanics that have no real-world analog for users to pattern-match against.

A practice mode solves this without adding friction to the main game. Users who need help self-select into it. Users who do not need it never see it after their first session.

---

## 2. Solution Overview

A standalone `/practice` route that walks first-time visitors through one guided practice round. The practice round uses a fixed question, disables the timer, and introduces the three confusing mechanics via inline coaching cards that appear at the right moment and dismiss naturally.

Key constraints:

- **No game state written to cookies.** Practice uses ephemeral React state only. Streaks, games played, and daily state are untouched.
- **No share output.** Practice results are not real and must not leak into social posts.
- **No modifications to existing components.** Practice reuses `GuessInput`, `GuessHistory`, `GuessRow`, and `QuestionDisplay` as-is. It has its own orchestrator (`PracticeBoard`) instead of modifying `GameBoard`.
- **Self-dismissing.** The practice link only appears for users who have not practiced. After completing practice, a cookie flag hides the link permanently.

---

## 3. UX Flow

```
First-time visitor lands on /
    |
    v
ReadyScreen
    |-- "I'm Ready" button (primary CTA, unchanged)
    |-- Practice link below button (only if no way-off_practiced cookie)
    |       "New here? Take a practice round -- no timer, no pressure."
    |
    v (taps practice link)
/practice route
    |
    v
Practice ReadyScreen
    |-- No timer, guided intro text
    |-- "Start Practice" button
    |
    v
Practice Play Screen
    |-- Step 1: Magnitude coaching card (visible on load, below buttons)
    |-- Player submits guess 1
    |-- Step 1 card dismissed (if not already)
    |-- Step 2: Feedback coaching card (appears after guess 1)
    |-- Player submits guess 2
    |-- Step 2 card fades out
    |-- Step 3: Timer warning card (appears after guess 2)
    |-- Player submits guess 3
    |-- Step 3 card fades out
    |-- Remaining guesses play without coaching
    |
    v (game ends -- win or 5 guesses used)
Practice Reveal Screen
    |-- Answer + explanation (same popIn animation)
    |-- Emoji trail of guesses
    |-- NO share button
    |-- NO stats written
    |-- Contextual completion message
    |-- "Play Today's Question ->" CTA
    |-- Sets way-off_practiced=1 cookie
    |
    v (taps CTA)
/ (daily game, normal flow)
```

---

## 4. Entry Point -- Modified ReadyScreen

The practice link is a subtle text link rendered below the "I'm Ready" button in `components/ReadyScreen.tsx`. It appears only for first-time visitors.

### Visibility Logic

```typescript
// In ReadyScreen component
import { hasPracticed } from "@/lib/cookies";

// Only render practice link when user has not practiced
{!hasPracticed() && (
  <a href="/practice" className="...">
    New here? Take a practice round — no timer, no pressure.
  </a>
)}
```

- When `hasPracticed()` returns `true`, the link does not render at all.
- If a user navigates directly to `/practice` after having practiced (e.g., types the URL), allow it. Just do not re-write the cookie.

### Styling

The link must be visually subordinate to the primary "I'm Ready" CTA:

```
text-sm text-text-muted
"New here?" in text-text-muted
"Take a practice round" in text-accent
```

No underline by default. Underline on hover/focus. The link must not compete with the primary button for attention.

### Wireframe

```
+------------------------------------------+
|              #42                          |
|           [ Time ]                        |
|                                           |
|  +--------------------------------------+ |
|  | Guess the number. You get 5 tries.   | |
|  | We'll tell you if you're hot, warm,  | |
|  | or cold -- and which direction to go. | |
|  |                                       | |
|  |  [checkmark] Within 2%   [fire] Within 5%  | |
|  |  [thermo] Within 20%  [snow] Beyond 20%  | |
|  |                                       | |
|  | 20s for your first guess, then 10s.  | |
|  +--------------------------------------+ |
|                                           |
|  +--------------------------------------+ |
|  |            I'm Ready                  | |
|  +--------------------------------------+ |
|                                           |
|  New here? Take a practice round --      |
|  no timer, no pressure.                  |
|                                           |
+------------------------------------------+
```

---

## 5. Practice Question

A single hardcoded question, defined as a constant. This question is never served as a daily question and does not exist in the questions database.

### Why This Question

"How long is 1 billion seconds?" -> 31.7 years

- **Forces magnitude button understanding.** The answer is 31.7 -- a small number that does NOT require a magnitude multiplier. Users who reflexively tap a magnitude button will see the preview jump to millions/billions, teaching the multiplier concept through direct experience.
- **Strong "wait, WHAT?" moment.** Most people guess thousands of years or millions of seconds-worth of time. The reveal that a billion seconds is a human lifetime is genuinely surprising.
- **Teaches decimal input.** The answer is 31.7, not a round number. Users learn that decimal input works.

### Definition

File: `lib/practice-question.ts`

```typescript
import { Category } from "@/types";

export const PRACTICE_QUESTION = {
  id: "practice",
  question: "How long is 1 billion seconds?",
  answer: 31.7,
  unit: "years",
  category: "TIME" as Category,
  explanation:
    "One billion seconds is about 31.7 years. A billion is so large that " +
    "most people's first guess is off by decades.",
  source: "https://www.wolframalpha.com/input?i=1+billion+seconds+in+years",
};
```

Note: This object intentionally does not include `_id`, `date`, `difficulty`, or `questionNumber` fields because it is never stored in the database and never appears in share output.

---

## 6. Practice Board Behavior

`PracticeBoard` is the practice-mode orchestrator. It mirrors the structure of `GameBoard` but with critical differences:

| Aspect | GameBoard (daily) | PracticeBoard (practice) |
|--------|-------------------|--------------------------|
| State management | `usePersistedGame` hook (cookie-backed) | Local `useState` only |
| Timer | `GuessTimer` component, 20s/10s | Static label: "No timer in practice" |
| Cookie writes | Every guess + game over | None (except `way-off_practiced` on reveal) |
| Stats tracking | Increments `gp`, updates `sk`/`sl` | No stats touched |
| Share button | Shown on reveal | Not shown |
| Coaching cards | None | Steps 1-3 (contextual) |
| Question source | Server-fetched daily question | `PRACTICE_QUESTION` constant |

### Timer Replacement

The `GuessTimer` component is **not rendered** in practice mode. Instead, a static label occupies the same visual slot to prevent layout shift:

```tsx
{/* Same height as GuessTimer (h-2.5 + mb-3 container) */}
<div className="w-full h-2.5 mb-3 flex items-center justify-center">
  <span className="text-xs text-text-muted">No timer in practice</span>
</div>
```

### Input State

The `GuessInput` component is reused without modification. In practice mode:
- `disabled` is `false` at all times (no timer gating)
- `showHint` is `true` for the first guess (same as daily)
- `timerRunning` is `true` at all times (keeps input enabled; the prop name is a misnomer in this context -- it controls whether the input accepts submissions)
- `focusTrigger` increments after each guess to refocus the input

### Guess Handling

Guesses are processed using the existing `getFeedback()` function from `lib/game-logic.ts`. The response time field is set to `0` for all practice guesses (no timer to measure against).

### Game Over Detection

Same rules as the daily game:
- Win: feedback level is `"exact"` or `"close"` (checked via `isWinningFeedback()`)
- Loss: 5 guesses used without winning
- No timeout path exists (no timer)

---

## 7. Coaching Cards

Three inline coaching cards appear at specific moments during the practice round. They are rendered by a shared `PracticeCoachingCard` component and positioned in the DOM flow (not floating, not modal).

### PracticeCoachingCard Component

File: `components/PracticeCoachingCard.tsx`

```typescript
interface PracticeCoachingCardProps {
  children: React.ReactNode;
  visible: boolean;
  onDismiss?: () => void;
}
```

Styling:

```
bg-accent/10 border border-accent/20 rounded-xl px-4 py-3
text-sm text-text-secondary leading-relaxed
animate-fadeSlideIn
```

When `visible` transitions from `true` to `false`, the card fades out over 300ms before unmounting (use `animate-fadeOut` or a controlled opacity transition).

### Step 1 -- Magnitude Button Coaching

**When:** Visible on page load, before the user interacts.

**Where:** Inline, rendered immediately below the magnitude buttons (Thousand / Million / Billion / Trillion grid). Not between the input field and the buttons -- that would push buttons below the fold on small screens.

**Copy:**
> These buttons multiply your number. Type 31, tap Billion -- the preview shows 31,000,000,000. Tap any button to try it.

**Dismiss conditions (whichever comes first):**
1. User taps any magnitude button
2. User taps the "Got it" link/button within the card

**Contains:** A "Got it" text button aligned right within the card, styled as `text-accent text-sm font-medium`.

**Layout:**

```
+------------------------------------------+
|  How long is 1 billion seconds?          |
|  (in years)            4 guesses left    |
|                                           |
|  [ input field                     ] [>] |
|                                           |
|  [ Thousand ] [ Million  ]               |
|  [ Billion  ] [ Trillion ]               |
|                                           |
|  +--------------------------------------+ |
|  | These buttons multiply your number.  | |
|  | Type 31, tap Billion -- the preview  | |
|  | shows 31,000,000,000.                | |
|  | Tap any button to try it.            | |
|  |                              Got it  | |
|  +--------------------------------------+ |
|                                           |
|  ======================================  |  <- timer slot ("No timer in practice")
+------------------------------------------+
```

### Step 2 -- Feedback Coaching

**When:** Appears after guess 1 is submitted and feedback is rendered.

**Where:** Inline, below the guess history list.

**Copy:**
> That's your hot/cold feedback. The snowflake means you're far off. The arrow tells you which direction to guess next. Each guess narrows it down.

**Dismiss:** Fades out automatically when guess 2 is submitted.

**Layout:**

```
+------------------------------------------+
|  How long is 1 billion seconds?          |
|  (in years)            4 guesses left    |
|                                           |
|  +--------------------------------------+ |
|  | [snow] 1,000  Cold  Guess WAY lower! | |
|  | ============================== 100%  | |
|  +--------------------------------------+ |
|                                           |
|  +--------------------------------------+ |
|  | That's your hot/cold feedback. The   | |
|  | snowflake means you're far off. The  | |
|  | arrow tells you which direction to   | |
|  | guess next. Each guess narrows it    | |
|  | down.                                | |
|  +--------------------------------------+ |
|                                           |
|  [ input field                     ] [>] |
|  ...                                     |
+------------------------------------------+
```

### Step 3 -- Timer Warning

**When:** Appears after guess 2 is submitted.

**Where:** Inline, below the guess history list (same position as Step 2).

**Copy:**
> In the real game, a 10-second timer starts after each guess. A timeout burns one of your 5 guesses -- it counts as a clock emoji in your results.

**Dismiss:** Fades out automatically when guess 3 is submitted.

---

## 8. Practice Reveal Screen

The practice reveal screen reuses the visual structure of `RevealScreen` but with key differences. It should be implemented as a section within `PracticeBoard` rather than importing `RevealScreen` directly, because the modifications (no share, no stats, custom CTA) would require too many conditional props.

### What is shown:

1. **Result badge** -- "Solved in N/5 guesses!" or a neutral loss message (no rotating loss messages needed; use the contextual copy below).
2. **Question text** -- "How long is 1 billion seconds?"
3. **Big answer number** -- "31.7" with `animate-popIn`, colored green on solve.
4. **Unit** -- "years" in uppercase tracking.
5. **Explanation card** -- Same `bg-bg-secondary` card as daily reveal.
6. **Emoji trail** -- Visual summary of the practice guesses.
7. **Completion card** -- Contextual messaging (see below).
8. **Primary CTA** -- "Play Today's Question" button.

### What is NOT shown:

- **Share button** -- Omitted entirely. Practice results are not real and must not appear in social posts.
- **Stats updates** -- No `gamesPlayed`, `streak`, or `longestStreak` modifications.
- **Countdown timer** -- "Next question in HH:MM:SS" is irrelevant here.
- **Confetti** -- Reserved for real wins.

### Completion Card Copy

Contextual based on outcome:

| Outcome | Copy |
|---------|------|
| Solved | Now you know the controls. The real question is waiting -- and it won't give you any hints up front. |
| Not solved | You'll get the hang of it. The real question resets everything -- 5 fresh guesses, no practice pressure. |

Styled as a simple text block, `text-sm text-text-secondary`, centered, with `mb-6` spacing above the CTA.

### Primary CTA

```tsx
<a
  href="/"
  className="block w-full py-4 text-lg font-semibold text-white text-center rounded-xl
             transition-transform active:scale-95 animate-pulseGlow"
  style={{
    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
  }}
>
  Play Today's Question &rarr;
</a>
```

- Uses `animate-pulseGlow` (existing animation from the design system).
- Navigates to `/` which loads the daily game with the normal ReadyScreen.
- Container needs `pb-[env(safe-area-inset-bottom)]` for iPhone home indicator clearance.

### Cookie Write

On reveal screen render (not on CTA click), set the practiced cookie:

```typescript
useEffect(() => {
  markPracticed();
}, []);
```

This ensures the cookie is written even if the user navigates away without tapping the CTA.

### Wireframe

```
+------------------------------------------+
|                                           |
|     [ Solved in 3/5 guesses! ]           |
|                                           |
|   How long is 1 billion seconds?         |
|                                           |
|              31.7                         |
|              YEARS                        |
|                                           |
|  +--------------------------------------+ |
|  | DID YOU KNOW?                        | |
|  | One billion seconds is about 31.7    | |
|  | years. A billion is so large that    | |
|  | most people's first guess is off by  | |
|  | decades.                             | |
|  +--------------------------------------+ |
|                                           |
|         [snow] [thermo] [fire] [check]   |
|                                           |
|   Now you know the controls. The real    |
|   question is waiting -- and it won't    |
|   give you any hints up front.           |
|                                           |
|  +--------------------------------------+ |
|  |      Play Today's Question ->        | |
|  +--------------------------------------+ |
|                                           |
+------------------------------------------+
```

---

## 9. Cookie Strategy

Practice mode introduces one new cookie, completely separate from the game state cookie (`way-off_state`). The two cookies never interact.

### New Cookie

| Property | Value |
|----------|-------|
| Name | `way-off_practiced` |
| Value | `1` |
| Path | `/` |
| Max-Age | `34560000` (~400 days, matching `way-off_state` lifetime) |
| SameSite | `Lax` |
| Secure | `true` |

### Implementation

Added to `lib/cookies.ts`:

```typescript
const PRACTICE_COOKIE = "way-off_practiced";
const PRACTICE_MAX_AGE = 400 * 24 * 60 * 60; // ~13 months

/**
 * Returns true if the user has completed practice mode.
 * Returns false on the server (SSR-safe).
 */
export function hasPracticed(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes(`${PRACTICE_COOKIE}=1`);
}

/**
 * Sets the practiced flag cookie. Called once on practice reveal screen render.
 * Idempotent -- safe to call multiple times.
 */
export function markPracticed(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${PRACTICE_COOKIE}=1; path=/; max-age=${PRACTICE_MAX_AGE}; SameSite=Lax; Secure`;
}
```

### What This Cookie Does NOT Do

- It does not store practice game state (guesses, result). Practice state is React-only and lost on navigation.
- It does not affect the `way-off_state` cookie in any way.
- It does not gate access to `/practice`. Users can revisit `/practice` after the cookie is set; the cookie only controls visibility of the ReadyScreen practice link.

---

## 10. Routing

Practice mode lives at `/practice` as a dedicated route, not a modal or overlay.

### Why a Separate Route

- **URL isolation.** Navigating to `/practice` does not touch the `/` page state. No risk of contaminating the daily game's cookie state mid-session.
- **Clean back-button behavior.** Browser back from `/practice` returns to `/`. No modal dismiss edge cases.
- **Bookmarkable.** Users (or support staff) can link directly to `/practice`.
- **Analytics-friendly.** Page views on `/practice` are automatically tracked as a distinct path.

### File Structure

```
app/
  practice/
    page.tsx          # Server component, renders PracticeBoard
```

### Server Component

`app/practice/page.tsx` is a minimal server component:

```typescript
import PracticeBoard from "@/components/PracticeBoard";
import { PRACTICE_QUESTION } from "@/lib/practice-question";

export const metadata = {
  title: "Practice -- Way Off",
  description: "Learn how to play Way Off with a guided practice round.",
};

export default function PracticePage() {
  return <PracticeBoard question={PRACTICE_QUESTION} />;
}
```

No API call. No database query. The practice question is a compile-time constant.

---

## 11. Mobile Considerations

Practice mode inherits all mobile requirements from `CLAUDE.md`. The following are practice-specific concerns:

### Touch Targets

- "Got it" dismiss button in the magnitude coaching card: minimum 44px tap target. Use `py-2 px-3` minimum, or make the entire card dismissible.
- "Play Today's Question" CTA: full-width, `py-4` (48px+ effective height).

### Coaching Card Positioning

Coaching cards sit **below** the magnitude buttons, never between the input field and the buttons. On small screens (iPhone SE, 375px width), the magnitude buttons may already be near the bottom of the visible area when the keyboard is open. Inserting a card above the buttons would push them off-screen.

### Scroll Into View

Each coaching card calls `scrollIntoView({ behavior: "smooth", block: "nearest" })` on mount to ensure it is visible, especially after guess submissions that may have scrolled the page.

```typescript
const cardRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (visible) {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, [visible]);
```

### Layout Shift Prevention

The "No timer in practice" label must occupy the exact same height as the `GuessTimer` component (`h-2.5` = 10px bar height). The container div in `GameBoard` uses `mb-3`, so the practice replacement must match: `h-2.5 mb-3`.

### Safe Area Insets

The "Play Today's Question" button container on the reveal screen needs bottom padding for the iPhone home indicator:

```
pb-[env(safe-area-inset-bottom)]
```

### Viewport

The practice page uses `min-h-dvh` (dynamic viewport height), not `vh`, to avoid mobile toolbar clipping issues. This matches the existing layout pattern.

---

## 12. File Map

### New Files

| File | Purpose | Approximate Size |
|------|---------|-----------------|
| `app/practice/page.tsx` | Server component. Imports `PracticeBoard` and `PRACTICE_QUESTION`, sets page metadata. | ~15 lines |
| `components/PracticeBoard.tsx` | Practice game orchestrator. Manages ephemeral React state, renders coaching cards, handles guess flow, renders practice reveal. | ~200 lines |
| `components/PracticeCoachingCard.tsx` | Reusable inline coaching card. Accepts `visible`, `onDismiss`, and `children` props. Handles fade-in/fade-out animations. | ~40 lines |
| `lib/practice-question.ts` | Exports `PRACTICE_QUESTION` constant. | ~15 lines |

### Modified Files

| File | Change | Lines Affected |
|------|--------|---------------|
| `lib/cookies.ts` | Add `hasPracticed()` and `markPracticed()` functions. Add `PRACTICE_COOKIE` and `PRACTICE_MAX_AGE` constants. | ~15 new lines appended |
| `components/ReadyScreen.tsx` | Import `hasPracticed` from cookies. Add conditional practice link below the "I'm Ready" button. Add `Link` or `<a>` element with practice copy. | ~10 new lines |

### Unchanged Files (Intentionally)

These files are reused as-is by `PracticeBoard` without any modifications:

| File | Reason for No Change |
|------|---------------------|
| `components/GameBoard.tsx` | Practice has its own orchestrator (`PracticeBoard`). Avoids polluting the daily game with practice conditionals. |
| `hooks/usePersistedGame.ts` | Practice uses ephemeral `useState`, not cookie-backed persistence. |
| `components/GuessInput.tsx` | Reused as-is. Props are sufficient to control behavior. |
| `components/GuessHistory.tsx` | Reused as-is. Accepts a `guesses` array regardless of source. |
| `components/GuessRow.tsx` | Reused as-is. Renders a single guess with feedback. |
| `components/QuestionDisplay.tsx` | Reused as-is. Accepts question text, unit, and guesses left. |
| `components/GuessTimer.tsx` | Not rendered in practice mode. Replaced with a static label. |
| `components/RevealScreen.tsx` | Not imported by `PracticeBoard`. The practice reveal is inlined because it omits share, stats, countdown, and confetti. |
| `lib/game-logic.ts` | Reused as-is. `getFeedback()`, `isWinningFeedback()`, `formatNum()`, `parseInput()` all work unchanged. |
| `lib/share.ts` | Not called in practice mode. |

---

## 13. Implementation Phases

### Pass 1 -- Ship Before Soft Launch

Everything needed for a functional practice mode. This is the minimum viable practice experience.

| Task | Files |
|------|-------|
| Create `lib/practice-question.ts` with hardcoded question | `lib/practice-question.ts` (new) |
| Add `hasPracticed()` and `markPracticed()` to cookies | `lib/cookies.ts` (modify) |
| Add conditional practice link to ReadyScreen | `components/ReadyScreen.tsx` (modify) |
| Create `/practice` route and server component | `app/practice/page.tsx` (new) |
| Build `PracticeBoard` with ephemeral state, no timer, basic play flow | `components/PracticeBoard.tsx` (new) |
| Build `PracticeCoachingCard` component | `components/PracticeCoachingCard.tsx` (new) |
| Implement Step 1 coaching card only (magnitude buttons) | Inside `PracticeBoard` |
| Build practice reveal screen (no share, no stats, CTA to daily game) | Inside `PracticeBoard` |
| Set `way-off_practiced` cookie on reveal render | Inside `PracticeBoard` |

**Pass 1 does NOT include:**
- Step 2 (feedback coaching card)
- Step 3 (timer warning card)
- Mini CSS animation demo inside the magnitude coaching card
- Analytics tracking

### Pass 2 -- Based on Post-Launch Feedback

Add the remaining coaching cards and instrumentation after observing whether users complete practice mode and whether it improves daily game performance.

| Task | Files |
|------|-------|
| Add Step 2: Feedback coaching card (after guess 1, fades after guess 2) | `components/PracticeBoard.tsx` (modify) |
| Add Step 3: Timer warning card (after guess 2, fades after guess 3) | `components/PracticeBoard.tsx` (modify) |
| Add mini CSS animation demo inside Step 1 magnitude coaching card (before/after preview states) | `components/PracticeCoachingCard.tsx` or inline in `PracticeBoard` |
| Analytics: track practice link clicks from ReadyScreen | `components/ReadyScreen.tsx` (modify) |
| Analytics: track practice completion rate (reached reveal) | `components/PracticeBoard.tsx` (modify) |
| Analytics: compare daily game performance of practiced vs. unpracticed users | Server-side or analytics dashboard |

---

## 14. Coaching Copy Reference

All user-facing copy for practice mode, finalized. Do not ad-lib or rephrase during implementation.

| Context | Copy |
|---------|------|
| **ReadyScreen link** | New here? Take a practice round -- no timer, no pressure. |
| **Practice ready info card** | Enter any number, then tap a magnitude button to scale it. Tap Billion to multiply by 1,000,000,000. The real game gives you 10 seconds per guess -- here, take your time. |
| **Step 1: Magnitude overlay** | These buttons multiply your number. Type 31, tap Billion -- the preview shows 31,000,000,000. Tap any button to try it. |
| **Step 2: Feedback card** | That's your hot/cold feedback. The snowflake means you're far off. The arrow tells you which direction to guess next. Each guess narrows it down. |
| **Step 3: Timer card** | In the real game, a 10-second timer starts after each guess. A timeout burns one of your 5 guesses -- it counts as a clock emoji in your results. |
| **Reveal -- solved** | Now you know the controls. The real question is waiting -- and it won't give you any hints up front. |
| **Reveal -- not solved** | You'll get the hang of it. The real question resets everything -- 5 fresh guesses, no practice pressure. |
| **Reveal CTA button** | Play Today's Question |

---

## 15. What NOT to Build

These ideas were considered and explicitly rejected. Do not revisit without new evidence.

| Idea | Why Not |
|------|---------|
| Progress bar / step counter (1 of 3, 2 of 3...) | Frames practice as a chore. Players should feel like they are playing, not completing training modules. |
| Skip button visible from the start | Makes players second-guess whether they should skip. The "Got it" dismiss on Step 1 is sufficient for users who understand quickly. |
| Animated mascot or character guide | Wrong tone. Way Off is minimal and data-driven, not playful-mascot territory. |
| Full-screen modal overlays for coaching | Blocks the interface. Coaching must be inline and contextual -- users should see the real UI behind/around the coaching card. |
| Replay option in settings | The direct URL `/practice` suffices. No need to add UI surface area in settings for a feature used once. |
| Practice stats or share output | Confuses daily stats. Practice results are ephemeral and must never be stored or shared. |
| "Tutorial complete" badge or achievement | Out of scope. No achievement system exists. |
| Multiple practice questions | Over-engineering. One question teaches all three mechanics. Adding variety adds maintenance burden with no UX benefit. |
| Server-side practice state | No reason to persist practice state. If the user refreshes `/practice`, they start over. That is fine. |
