"use client";

import { useState } from "react";
import { Guess } from "@/types";
import { generateShareText } from "@/lib/share";

interface ShareButtonProps {
  questionNumber: number;
  guesses: Guess[];
  solved: boolean;
  answer: number;
  unit: string;
}

export default function ShareButton({
  questionNumber,
  guesses,
  solved,
  answer,
  unit,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    const url =
      typeof window !== "undefined" ? window.location.origin : "";
    return generateShareText(questionNumber, guesses, solved, answer, unit, url);
  };

  const handleShare = async () => {
    const text = getShareText();

    // Prefer native share sheet on mobile
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        // User cancelled or share failed — fall through to clipboard
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: select-and-copy prompt
      prompt("Copy your result:", text);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className="w-full py-4 text-base font-semibold text-white rounded-xl transition-all duration-300 mb-3 active:scale-95"
        style={{
          background: copied
            ? "#10B981"
            : "linear-gradient(135deg, #6366F1, #8B5CF6)",
        }}
      >
        {copied ? "Copied!" : "Share Result"}
      </button>

      <details className="mb-6">
        <summary className="text-xs text-text-dim text-center cursor-pointer py-2 select-none">
          Preview what&apos;s shared
        </summary>
        <div className="bg-bg-primary rounded-[10px] p-4 text-[13px] font-mono text-text-muted text-left leading-[1.8] whitespace-pre-line mt-1 border border-bg-secondary">
          {getShareText()}
        </div>
      </details>
    </>
  );
}
