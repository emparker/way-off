import { Feedback } from "@/types";

export const MAX_GUESSES = 5;
export const GUESS_TIMER_MS = 10000;

/** First guess gets 20s to digest the question; subsequent guesses get 10s. */
export function getTimerMs(guessIndex: number): number {
  return guessIndex === 0 ? 20000 : 10000;
}

export function getFeedback(guess: number, answer: number): Feedback {
  const logDist = getLogDistance(guess, answer);
  const direction = guess < answer ? "higher" : ("lower" as const);
  const dirWord = direction === "higher" ? "higher" : "lower";

  if (logDist <= 0.01)
    return { level: "exact", emoji: "✅", color: "#10B981", label: "Nailed it!", direction: null };
  if (logDist <= 0.03)
    return { level: "close", emoji: "🎯", color: "#10B981", label: "Close enough!", direction: null };
  if (logDist <= 0.05)
    return { level: "hot", emoji: "🔥", color: "#EF4444", label: "So close!", direction };
  if (logDist <= 0.15)
    return { level: "warm", emoji: "🌡️", color: "#F59E0B", label: `Guess a bit ${dirWord}`, direction };
  if (logDist <= 0.5)
    return { level: "cool", emoji: "🧊", color: "#38BDF8", label: `Guess ${dirWord}`, direction };
  if (logDist <= 1.0)
    return { level: "cold", emoji: "❄️", color: "#3B82F6", label: `Guess ${dirWord}`, direction };
  return { level: "cold", emoji: "❄️", color: "#3B82F6", label: `Guess WAY ${dirWord}!`, direction };
}

/** Whether a feedback level counts as a win. */
export function isWinningFeedback(level: Feedback["level"]): boolean {
  return level === "exact" || level === "close";
}

export function parseInput(val: string): number | null {
  const s = val.trim().toLowerCase().replace(/,/g, "");
  if (!s) return null;
  const multipliers: Record<string, number> = {
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12,
  };
  const lastChar = s.charAt(s.length - 1);
  if (multipliers[lastChar]) {
    const num = parseFloat(s.slice(0, -1));
    return isNaN(num) ? null : num * multipliers[lastChar];
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

export function formatNum(n: number): string {
  if (Math.abs(n) >= 1e12)
    return (n / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
  if (Math.abs(n) >= 1e9)
    return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (Math.abs(n) >= 1e6)
    return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1e4)
    return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

/** Log-scale distance: |log10(guess / answer)|. 1.0 = one order of magnitude off. */
export function getLogDistance(guess: number, answer: number): number {
  if (guess <= 0 || answer <= 0) return Infinity;
  return Math.abs(Math.log10(guess / answer));
}
