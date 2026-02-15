"use client";

import { useState, useEffect } from "react";
import { Guess } from "@/types";
import { formatNum } from "@/lib/game-logic";

function ProgressBar({ pctOff, color }: { pctOff: number; color: string }) {
  const [mounted, setMounted] = useState(false);
  const clampPct = Math.min(pctOff * 100, 100);
  const fillPct = 100 - clampPct;

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="w-full h-2 bg-bg-primary rounded overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(fillPct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Guess accuracy"
    >
      <div
        className="h-full rounded transition-[width] duration-500 ease-out"
        style={{
          width: mounted ? `${Math.max(fillPct, 3)}%` : "0%",
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
  if (guess.timedOut) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2.5 bg-bg-secondary rounded-[10px] border border-border animate-fadeSlideIn">
        <span className="text-[22px] w-8 text-center" role="img" aria-label="Timed out">⏰</span>
        <div className="flex-1">
          <span className="text-sm font-medium text-text-dim">
            Time&apos;s up!
          </span>
        </div>
      </div>
    );
  }

  const { value, feedback, pctOff } = guess;

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5 bg-bg-secondary rounded-[10px] border border-solid animate-fadeSlideIn"
      style={{ borderColor: `${feedback.color}33` }}
    >
      <span className="text-[22px] w-8 text-center" role="img" aria-label={feedback.label}>{feedback.emoji}</span>
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
              <span className="text-2xl animate-slamIn inline-block" role="img" aria-label={`Go ${feedback.direction}`}>
                {pctOff > 1.0
                  ? feedback.direction === "higher"
                    ? "⬆️⬆️⬆️"
                    : "⬇️⬇️⬇️"
                  : pctOff > 0.5
                    ? feedback.direction === "higher"
                      ? "⬆️⬆️"
                      : "⬇️⬇️"
                    : feedback.direction === "higher"
                      ? "⬆️"
                      : "⬇️"}
              </span>
            )}
          </span>
        </div>
        <ProgressBar pctOff={pctOff} color={feedback.color} />
      </div>
    </div>
  );
}
