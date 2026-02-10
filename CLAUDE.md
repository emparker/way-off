# CLAUDE.md

## Project
Daily estimation game — a Wordle-style viral web game where players guess real-world numeric values with hot/cold feedback. One question per day, five guesses, spoiler-free emoji sharing.

Name is TBD. Use "Guesstimate" as placeholder throughout codebase until finalized.

## Tech Stack
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS (dark mode only, no CSS modules)
- MongoDB Atlas with Mongoose
- Deployed on Vercel
- No auth for MVP — cookie-based anonymous sessions

## Key Files
- `docs/claude-project-knowledge.md` — Full architecture, data models, game logic, design system, competitive analysis, and development roadmap. **Read this first before any major task.**
- `docs/roadmap.md` — Development phases, architecture decisions, cookie schema, implementation patterns, risk register. **Living status tracker.**
- `docs/game-prototype.tsx` — Working React prototype. This is the UI/UX source of truth. Port this into the Next.js structure, converting to TypeScript and Tailwind classes.

## Code Style
- TypeScript strict mode
- Functional components with hooks
- Tailwind utility classes only (no custom CSS unless animations)
- Concise variable names where clear (e, i, el, etc.)
- Colocate components near their routes when possible
- Use Next.js App Router conventions: layout.tsx, page.tsx, loading.tsx, route.ts
- ESLint + Prettier defaults

## Project Structure
```
app/
  layout.tsx, page.tsx, globals.css
  api/question/today/route.ts
  api/stats/route.ts
  archive/page.tsx
  about/page.tsx
components/
  GameBoard.tsx, QuestionDisplay.tsx, GuessInput.tsx,
  GuessHistory.tsx, GuessRow.tsx, RevealScreen.tsx,
  ShareButton.tsx, StatsModal.tsx, Header.tsx
lib/
  db.ts, game-logic.ts, cookies.ts, share.ts
  models/Question.ts, models/Session.ts
hooks/
  useGameState.ts, useStreak.ts
types/
  index.ts
scripts/
  seed-questions.ts, generate-questions.ts
```

## Game Logic (core rules)
- 5 max guesses per daily question
- Feedback thresholds: ✅ Exact (≤2% off) · 🔥 Hot (≤5%) · 🌡️ Warm (≤20%) · ❄️ Cold (>20%)
- Always show directional hint: ⬆️ Higher or ⬇️ Lower (except on exact)
- Input supports shorthand: 5k=5000, 2m=2000000, 1.5b=1500000000
- Share output is spoiler-free emoji grid — this is the most important feature for virality

## Design System
- Background gradient: #0F172A → #1E293B
- Cold #3B82F6 · Warm #F59E0B · Hot #EF4444 · Exact #10B981
- Accent #6366F1 (buttons, focus) · Accent hover #8B5CF6
- Text: primary #F8FAFC · secondary #CBD5E1 · muted #64748B
- Borders: #334155
- Font: Inter via next/font/google
- Max width 480px centered, mobile-first
- Animations: fadeIn, fadeSlideIn, popIn (bounce scale), shake (invalid input)

## Development Priorities
1. Share output — design everything around making it effortless and compelling
2. The reveal moment — the big number animation + explanation is the dopamine hit
3. Mobile UX — must feel native-app smooth on phones
4. Page speed — under 2 second loads, optimize aggressively

## Mobile-First Development (MANDATORY)
This app will ship to the Apple App Store. 80%+ of traffic comes from phones via social links. Every change must be validated against mobile UX. Treat mobile as the primary platform, desktop as secondary.

### Requirements for all code changes
- **Touch targets:** Minimum 44px, prefer 48px for primary actions
- **Viewport:** Always use `dvh` instead of `vh` for full-height layouts (avoids mobile keyboard/toolbar bugs)
- **Safe areas:** Respect `env(safe-area-inset-*)` for notched devices (iPhone 12+, Pixel Fold)
- **Tap feedback:** No default browser tap highlights; use `active:scale` or similar Tailwind utilities
- **Keyboards:** Use appropriate `inputMode` (`decimal` for numbers, `text` only when letters are required)
- **Sharing:** Always prefer `navigator.share()` (native share sheet) with `navigator.clipboard` as fallback
- **Scrolling:** Ensure content is never clipped by soft keyboards; scroll inputs into view on focus
- **Fonts:** Minimum 13px for metadata, 16px for body text (prevents iOS auto-zoom on input focus)
- **Animations:** Keep under 300ms for interactions, use `will-change` sparingly, respect `prefers-reduced-motion`
- **Testing mental model:** Every feature should feel like a native iOS app, not a website

## Decision Rules
- Ship speed over perfection — this is an MVP
- If a feature needs explanation, cut it
- When in doubt, look at how Wordle handled it
- Don't add auth, accounts, or login — cookies only
- Don't add monetization — way too early
- Every question must pass the "wait, WHAT?" test

## Common Tasks

### Adding a new question
Add to the questions collection in MongoDB or to `scripts/seed-questions.ts`. Every question needs: date, question, answer (number), unit, explanation, source URL, category, difficulty.

### Running locally
```bash
npm run dev          # Start dev server
npm run seed         # Seed database with questions
npm run lint         # Lint check
npm run build        # Production build
```

### Environment variables (.env.local)
```
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Do NOT
- Use localStorage or sessionStorage — use cookies for game state
- Add complex features before core game loop works perfectly
- Over-engineer the question delivery — MVP can send answer with question
- Add light mode — dark only for now
- Use any UI library (no MUI, Chakra, etc.) — Tailwind only
