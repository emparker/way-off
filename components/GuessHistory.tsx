"use client";

import { Guess } from "@/types";
import { formatNum } from "@/lib/game-logic";
import GuessRow from "./GuessRow";

interface GuessHistoryProps {
  guesses: Guess[];
  gameOver: boolean;
}

function RangeBounds({ guesses, gameOver }: GuessHistoryProps) {
  if (gameOver) return null;

  let lower = -Infinity;
  let upper = Infinity;

  for (const g of guesses) {
    if (g.timedOut || !g.feedback.direction) continue;
    if (g.feedback.direction === "higher" && g.value > lower) lower = g.value;
    if (g.feedback.direction === "lower" && g.value < upper) upper = g.value;
  }

  const hasLower = lower > -Infinity;
  const hasUpper = upper < Infinity;
  if (!hasLower && !hasUpper) return null;

  let text: string;
  if (hasLower && hasUpper) {
    text = `Between ${formatNum(lower)} and ${formatNum(upper)}`;
  } else if (hasLower) {
    text = `Higher than ${formatNum(lower)} ⬆️`;
  } else {
    text = `Lower than ${formatNum(upper)} ⬇️`;
  }

  return (
    <div className="flex justify-center mt-1 mb-1 animate-fadeIn">
      <span className="text-xs font-medium text-text-secondary px-3 py-1 rounded-full border-l-2 border-accent bg-bg-secondary/50">
        {text}
      </span>
    </div>
  );
}

export default function GuessHistory({ guesses, gameOver }: GuessHistoryProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 mb-6" role="log" aria-live="polite" aria-label="Guess history">
      {guesses.map((g, i) => (
        <GuessRow key={i} guess={g} />
      ))}
      <RangeBounds guesses={guesses} gameOver={gameOver} />
    </div>
  );
}
