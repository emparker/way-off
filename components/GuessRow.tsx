"use client";

import { Guess } from "@/types";
import { formatNum } from "@/lib/game-logic";

function ProgressBar({ pctOff, color }: { pctOff: number; color: string }) {
  const clampPct = Math.min(pctOff * 100, 100);
  const fillPct = 100 - clampPct;

  return (
    <div className="w-full h-2 bg-bg-primary rounded overflow-hidden">
      <div
        className="h-full rounded transition-[width] duration-500 ease-out"
        style={{
          width: `${Math.max(fillPct, 3)}%`,
          background: color,
        }}
      />
    </div>
  );
}

interface GuessRowProps {
  guess: Guess;
}

export default function GuessRow({ guess }: GuessRowProps) {
  const { value, feedback, pctOff } = guess;

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5 bg-bg-secondary rounded-[10px] border border-solid animate-fadeSlideIn"
      style={{ borderColor: `${feedback.color}33` }}
    >
      <span className="text-[22px] w-8 text-center">{feedback.emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-base text-text-primary">
            {formatNum(value)}
          </span>
          <span
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: feedback.color }}
          >
            {feedback.label}
            {feedback.direction && (
              <span className="text-sm">
                {feedback.direction === "higher" ? "⬆️" : "⬇️"}
              </span>
            )}
          </span>
        </div>
        <ProgressBar pctOff={pctOff} color={feedback.color} />
      </div>
    </div>
  );
}
