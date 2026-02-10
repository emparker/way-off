# Project Knowledge — Daily Estimation Game

## 1. PRODUCT VISION

A daily intuition game where players estimate real-world numeric values and get progressive hot/cold feedback. One question per day. Five guesses. Learn something mind-blowing every time.

Target: Wordle-level virality through simple mechanic + daily scarcity + spoiler-free sharing.

Tagline candidates:
- "Your brain vs. reality"
- "How close is your instinct?"
- "Think you know? Prove it."

---

## 2. TECH STACK

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | SSR for SEO, API routes, Vercel deploy |
| Language | TypeScript | Type safety for game logic |
| Styling | Tailwind CSS | Rapid iteration, dark mode support |
| Database | MongoDB Atlas | Flexible schema, Emily's expertise |
| ODM | Mongoose | Schema validation, indexes |
| Hosting | Vercel | Zero-config Next.js deploys |
| Analytics | Vercel Analytics or Plausible | Privacy-friendly |
| Auth | None (MVP) | Cookie-based anonymous tracking |

---

## 3. PROJECT STRUCTURE

```
/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Main game page
│   ├── globals.css             # Tailwind imports + custom animations
│   ├── api/
│   │   ├── question/
│   │   │   └── today/
│   │   │       └── route.ts    # GET today's question
│   │   └── stats/
│   │       └── route.ts        # GET/POST anonymous play stats
│   ├── archive/
│   │   └── page.tsx            # Past questions (locked/unlocked)
│   └── about/
│       └── page.tsx            # About page + SEO content
├── components/
│   ├── GameBoard.tsx           # Main game orchestrator
│   ├── QuestionDisplay.tsx     # Question text + metadata
│   ├── GuessInput.tsx          # Number input with shorthand parsing
│   ├── GuessHistory.tsx        # List of past guesses with feedback
│   ├── GuessRow.tsx            # Single guess with emoji + progress bar
│   ├── RevealScreen.tsx        # Answer reveal + explanation + share
│   ├── ShareButton.tsx         # Copy share output to clipboard
│   ├── StatsModal.tsx          # Streak, games played, accuracy
│   └── Header.tsx              # Game name, question number, category
├── lib/
│   ├── db.ts                   # MongoDB connection singleton
│   ├── models/
│   │   ├── Question.ts         # Mongoose Question model
│   │   └── Session.ts          # Mongoose Session model (optional)
│   ├── game-logic.ts           # getFeedback(), parseInput(), formatNum()
│   ├── cookies.ts              # Cookie helpers for game state
│   └── share.ts                # Generate share text output
├── hooks/
│   ├── useGameState.ts         # Game state management hook
│   └── useStreak.ts            # Streak tracking hook
├── types/
│   └── index.ts                # TypeScript interfaces
├── public/
│   ├── og-image.png            # Open Graph preview image
│   └── favicon.ico
├── scripts/
│   ├── seed-questions.ts       # Seed database with initial questions
│   └── generate-questions.ts   # AI question generation script
├── .env.local                  # MONGODB_URI, etc.
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 4. DATA MODELS

### Question
```typescript
interface Question {
  _id: string;
  date: string;              // "2026-02-10" — unique index, publish date
  question: string;           // "How long is 1 billion seconds?"
  answer: number;             // 31.7
  unit: string;               // "years"
  explanation: string;        // The "whoa" moment, 1-2 sentences
  source: string;             // URL or citation for credibility
  category: Category;         // "TIME" | "SCALE" | "HUMAN_BODY" | "SPACE" | "POP_CULTURE" | "HISTORY" | "WILD_CARD"
  difficulty: Difficulty;     // "easy" | "medium" | "hard"
  hotRange: number;           // default 0.05 (±5%)
  warmRange: number;          // default 0.20 (±20%)
  createdAt: Date;
  updatedAt: Date;
}
```

### GameState (client-side, cookie-stored)
```typescript
interface GameState {
  visitorId: string;          // UUID generated on first visit
  date: string;               // Today's date
  guesses: Guess[];
  result: "playing" | "win" | "loss";
  streak: number;
  longestStreak: number;
  gamesPlayed: number;
}

interface Guess {
  value: number;
  feedback: Feedback;
  pctOff: number;
  timestamp: number;
}

interface Feedback {
  level: "exact" | "hot" | "warm" | "cold";
  emoji: string;
  color: string;
  label: string;
  direction: "higher" | "lower" | null;
}
```

---

## 5. CORE GAME LOGIC

### Feedback Algorithm
```typescript
export function getFeedback(guess: number, answer: number): Feedback {
  const pctOff = Math.abs(guess - answer) / answer;
  const direction = guess < answer ? "higher" : "lower";

  if (pctOff <= 0.02) return { level: "exact", emoji: "✅", color: "#10B981", label: "Nailed it!", direction: null };
  if (pctOff <= 0.05) return { level: "hot", emoji: "🔥", color: "#EF4444", label: "Very hot!", direction };
  if (pctOff <= 0.20) return { level: "warm", emoji: "🌡️", color: "#F59E0B", label: "Warm", direction };
  return { level: "cold", emoji: "❄️", color: "#3B82F6", label: "Cold", direction };
}
```

### Input Parser (supports shorthand)
```typescript
export function parseInput(val: string): number | null {
  const s = val.trim().toLowerCase().replace(/,/g, "");
  if (!s) return null;
  const multipliers: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
  const lastChar = s.charAt(s.length - 1);
  if (multipliers[lastChar]) {
    const num = parseFloat(s.slice(0, -1));
    return isNaN(num) ? null : num * multipliers[lastChar];
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}
```

### Number Formatter
```typescript
export function formatNum(n: number): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
```

### Share Output Generator
```typescript
export function generateShareText(gameName: string, questionNum: number, guesses: Guess[], solved: boolean, answer: number, unit: string, url: string): string {
  const emojis = guesses.map(g => g.feedback.emoji).join(" ");
  const result = solved ? emojis : `${emojis} ❌`;
  const firstOff = guesses[0] ? Math.abs(guesses[0].value - answer) : 0;
  return `${gameName} #${questionNum}\n\n${result}\n\nOff by ${formatNum(firstOff)} ${unit} at first 😅\n${url}`;
}
```

---

## 6. API ROUTES

### GET /api/question/today
Returns today's question without the answer (answer sent separately after all guesses or via reveal endpoint).

**Security consideration:** The answer should NOT be in the initial payload. Options:
- Option A: Send answer encrypted, decrypt client-side after game over (simpler)
- Option B: Validate guesses server-side via POST /api/guess (more secure, more complex)
- **MVP recommendation:** Option A — ship fast, harden later. Determined cheaters will always find the answer; the game's value is the daily habit, not competitive integrity.

### Response shape:
```json
{
  "id": 42,
  "date": "2026-02-10",
  "question": "How long is 1 billion seconds?",
  "unit": "years",
  "category": "TIME",
  "answer": 31.7,
  "explanation": "There are about 31.5 million seconds in a year...",
  "source": "https://..."
}
```

---

## 7. DESIGN SYSTEM

### Colors
```
--bg-primary:    #0F172A   (deepest background)
--bg-secondary:  #1E293B   (cards, elevated surfaces)
--border:        #334155   (subtle borders)
--text-primary:  #F8FAFC   (headings, numbers)
--text-secondary:#CBD5E1   (body text)
--text-muted:    #64748B   (labels, hints)
--text-dim:      #475569   (placeholders)

--cold:          #3B82F6   (blue)
--warm:          #F59E0B   (amber)
--hot:           #EF4444   (red/coral)
--exact:         #10B981   (green)
--accent:        #6366F1   (indigo — buttons, focus states)
--accent-hover:  #8B5CF6   (violet — gradients)
```

### Typography
- Font: Inter (via next/font/google) with system fallbacks
- Question: 22px, semibold
- Guess numbers: 16px, semibold
- Big reveal number: 52px, extra-bold, -1px letter-spacing
- Labels/hints: 12-13px, uppercase tracking

### Animations
- fadeIn: opacity 0→1
- fadeSlideIn: opacity 0→1 + translateY 10px→0
- popIn: scale 0.5→1.1→1 (for reveal number + emoji trail)
- shake: translateX oscillation (for invalid input)

### Layout
- Max width: 480px centered
- Padding: 20px horizontal
- Mobile-first, single column
- No hamburger menus, no sidebars — one screen, one purpose

---

## 8. COMPETITIVE INTELLIGENCE

### Direct competitors and their weaknesses:
- **Number Guesser** (number-guesser.com): Same mechanic, terrible UX, no daily cadence, no share output, no streaks
- **Higher Lower Game** (higherlowergame.com): Binary comparison (not estimation), no daily limit, 4.8M+ plays, PewDiePie featured it
- **Quantified Intuitions** (quantifiedintuitions.org): Monthly Fermi estimation, niche EA audience, ~90 visitors/month, requires Google login
- **Tom's Guide Guess the Number**: Daily historical date guessing, narrow scope

### Our advantages:
1. No dominant daily estimation game exists
2. Hot/cold + directional feedback (more engaging than binary comparison)
3. Daily scarcity (one question, come back tomorrow)
4. Spoiler-free emoji sharing (proven viral by Wordle)
5. AI-powered content pipeline (infinite questions)
6. Zero-friction (no login, no download)

---

## 9. QUESTION QUALITY CRITERIA

Every question MUST:
- ✅ Have an answer most people get wrong by 10x or more
- ✅ Create a "wait, WHAT?" reaction on reveal
- ✅ Be verifiable with a credible source
- ✅ Be accessible — no niche knowledge required
- ✅ Have a short, memorable explanation

Every question must NOT:
- ❌ Feel like math homework
- ❌ Require cultural or regional knowledge
- ❌ Have an answer that changes frequently (use stable facts)
- ❌ Be googleable in under 5 seconds (some friction is good)

### Sample questions (for seeding):
1. How long is 1 billion seconds? → 31.7 years
2. How many times does your heart beat in a day? → ~100,000
3. How many photos are taken worldwide every day? → ~1.4 billion
4. How far away is the Moon in miles? → ~238,900
5. How many grains of sand are on Earth? → ~7.5 quintillion (7.5e18)
6. How many emails are sent worldwide every day? → ~333 billion
7. How long would it take to walk to the Moon? → ~9 years
8. How many cells are in the human body? → ~37.2 trillion
9. How fast does a sneeze travel in mph? → ~100 mph
10. How many trees are on Earth? → ~3 trillion

---

## 10. DEVELOPMENT ROADMAP

### Phase 1: MVP (Week 1) — CURRENT FOCUS
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind
- [ ] Set up MongoDB Atlas cluster + Mongoose connection
- [ ] Create Question model + seed script with 30 questions
- [ ] Build GET /api/question/today route
- [ ] Build GameBoard component (port from prototype)
- [ ] Build GuessInput with shorthand parsing
- [ ] Build GuessHistory with feedback rows + progress bars
- [ ] Build RevealScreen with animated answer + explanation
- [ ] Build ShareButton with clipboard copy
- [ ] Cookie-based game state persistence (same-day reload protection)
- [ ] Mobile-responsive testing
- [ ] Deploy to Vercel

### Phase 2: Stickiness (Week 2)
- [ ] Streak tracking (current + longest)
- [ ] Stats modal (games played, win %, guess distribution)
- [ ] Daily reset with countdown timer on completion screen
- [ ] Open Graph meta tags + og-image for link previews
- [ ] Favicon + PWA manifest

### Phase 3: Content Pipeline (Week 3)
- [ ] AI question generation script using Claude API
- [ ] Admin review workflow (simple JSON file or lightweight admin)
- [ ] 30-day content buffer
- [ ] Themed day categories (Time Tuesday, Space Sunday, etc.)

### Phase 4: Growth (Week 4+)
- [ ] Archive page (past questions, locked until played)
- [ ] SEO blog pages for viral questions
- [ ] PWA with add-to-homescreen + offline support
- [ ] Social proof on reveal ("You're closer than 84% of players")
- [ ] Push notifications (optional)

---

## 11. REFERENCE: WORKING PROTOTYPE

A fully functional React prototype exists and should be used as the UI/UX reference for the Next.js build. Key patterns to preserve from the prototype:

- Dark gradient background (#0F172A → #1E293B)
- Guess rows with emoji + label + directional arrow + progress bar
- Shorthand input hint on first guess
- Input shake animation on invalid entry
- Purple gradient CTA buttons
- Reveal screen: badge → question → BIG animated number → unit → explanation card → emoji trail → share button → share preview
- The share preview box showing exactly what gets copied
- Smooth transitions between play → reveal screens

Port the prototype's component logic into the Next.js project structure, converting to TypeScript and Tailwind classes.
