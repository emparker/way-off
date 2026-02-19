"use client";

import { Category } from "@/types";

interface ReadyScreenProps {
  questionNumber: number;
  category: Category;
  onReady: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  TIME: "Time",
  SCALE: "Scale",
  HUMAN_BODY: "Human Body",
  SPACE: "Space",
  NATURE: "Nature",
  POP_CULTURE: "Pop Culture",
  HISTORY: "History",
  WILD_CARD: "Wild Card",
};

export default function ReadyScreen({
  questionNumber,
  category,
  onReady,
}: ReadyScreenProps) {
  return (
    <div className="pt-16 text-center animate-fadeIn">
      <div className="text-text-muted text-sm font-medium mb-3">
        #{questionNumber}
      </div>

      <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-8 bg-accent/15 text-accent border border-accent/25">
        {CATEGORY_LABELS[category] ?? category}
      </div>

      {/* How to play */}
      <div className="text-left bg-bg-secondary rounded-xl border border-border px-5 py-4 mb-8 space-y-3.5">
        <div className="text-sm text-text-secondary leading-relaxed">
          <span className="text-text-primary font-medium">Guess the number.</span>{" "}
          You get 5 tries. We&apos;ll tell you if you&apos;re hot, warm, or cold — and which direction to go.
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="text-base">✅</span>
            <span>Within 2%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <span>Within 5%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base">🌡️</span>
            <span>Within 20%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base">❄️</span>
            <span>Beyond 20%</span>
          </span>
        </div>
        <div className="text-xs text-text-secondary">
          20s for your first guess, then 10s each after.
        </div>
      </div>

      <button
        type="button"
        onClick={onReady}
        className="w-full py-4 text-lg font-semibold text-white rounded-xl transition-transform active:scale-95 animate-pulseGlow"
        style={{
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
        }}
      >
        I&apos;m Ready
      </button>
    </div>
  );
}
