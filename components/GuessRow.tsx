"use client";

import { useState, useEffect } from "react";
import { Guess } from "@/types";
import { formatNum } from "@/lib/game-logic";

function ProgressBar({ logDistance, color }: { logDistance: number; color: string }) {
  const [mounted, setMounted] = useState(false);
  // Map log distance to 0-100: 0 = perfect, 2.0+ = empty bar
  const clampPct = Math.min((logDistance / 2.0) * 100, 100);
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
      <div className="flex items-center gap-3 px-3.5 py-2.5 bg-bg-secondary rounded-[10px] border border-hot/20 animate-fadeSlideIn">
        <span className="text-[22px] w-8 text-center" role="img" aria-label="Timed out">⏰</span>
        <div className="flex-1">
          <div className="text-sm font-medium text-text-dim mb-1">
            Time&apos;s up!
          </div>
          <div className="w-full h-2 bg-bg-primary rounded overflow-hidden">
            <div className="h-full w-[3%] rounded bg-hot" />
          </div>
        </div>
      </div>
    );
  }

  const { value, feedback, logDistance } = guess;

  return (
    <div
      className="flex items-center gap-3 px-3.5 py-2.5 bg-bg-secondary rounded-[10px] border border-solid animate-fadeSlideIn"
      style={{ borderColor: `${feedback.color}33` }}
    >
      <span className="text-[18px] w-8 text-center shrink-0" role="img" aria-label={feedback.label}>{feedback.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-base text-text-primary tabular-nums">
            {formatNum(value)}
          </span>
          <span
            className="text-sm font-bold flex items-center gap-1 animate-clueIn"
            style={{ color: feedback.color }}
          >
            {feedback.label}
            {feedback.direction && (
              <span
                className="text-lg font-bold animate-slamIn inline-flex gap-0.5"
                style={{ color: feedback.color }}
                aria-label={`Go ${feedback.direction}`}
              >
                {Array.from({
                  length: logDistance > 1.0 ? 3 : logDistance > 0.5 ? 2 : 1,
                }).map((_, i) => (
                  <span key={i} aria-hidden="true">{feedback.direction === "higher" ? "↑" : "↓"}</span>
                ))}
              </span>
            )}
          </span>
        </div>
        <ProgressBar logDistance={logDistance} color={feedback.color} />
      </div>
    </div>
  );
}
