import { Feedback } from "@/types";

export const MAX_GUESSES = 5;
export const GUESS_TIMER_MS = 10000;

/** First guess gets 20s to digest the question; subsequent guesses get 10s. */
export function getTimerMs(guessIndex: number): number {
  return guessIndex === 0 ? 20000 : 10000;
}

export function getFeedback(
  guess: number,
  answer: number,
  hotRange = 0.05,
  warmRange = 0.2
): Feedback {
  const pctOff = Math.abs(guess - answer) / answer;
  const direction = guess < answer ? "higher" : ("lower" as const);

  const dirWord = direction === "higher" ? "higher" : "lower";

  if (pctOff <= 0.02)
    return {
      level: "exact",
      emoji: "✅",
      color: "#10B981",
      label: "Nailed it!",
      direction: null,
    };
  if (pctOff <= hotRange)
    return {
      level: "hot",
      emoji: "🔥",
      color: "#EF4444",
      label: "Almost!",
      direction,
    };
  if (pctOff <= warmRange)
    return {
      level: "warm",
      emoji: "🌡️",
      color: "#F59E0B",
      label: `A bit ${dirWord}`,
      direction,
    };
  if (pctOff <= 0.5)
    return {
      level: "cold",
      emoji: "❄️",
      color: "#3B82F6",
      label: dirWord.charAt(0).toUpperCase() + dirWord.slice(1),
      direction,
    };
  return {
    level: "cold",
    emoji: "❄️",
    color: "#3B82F6",
    label: `Way ${dirWord}`,
    direction,
  };
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
  if (Math.abs(n) >= 1e9)
    return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (Math.abs(n) >= 1e6)
    return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1e4)
    return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function getPctOff(guess: number, answer: number): number {
  return Math.abs(guess - answer) / answer;
}
