"use client";

import { useState, useRef, useEffect } from "react";
import { parseInput } from "@/lib/game-logic";

interface GuessInputProps {
  onGuess: (value: number) => void;
  disabled: boolean;
  showHint: boolean;
}

export default function GuessInput({
  onGuess,
  disabled,
  showHint,
}: GuessInputProps) {
  const [input, setInput] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) inputRef.current.focus();
  }, [disabled]);

  const handleSubmit = () => {
    const num = parseInput(input);
    if (num === null || num < 0 || isNaN(num)) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    onGuess(num);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  if (disabled) return null;

  return (
    <div>
      <div className={`flex gap-2.5 ${shaking ? "animate-shake" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Enter a number (e.g. 42, 5k, 1.2m)"
          className="flex-1 px-4 py-3.5 text-base bg-bg-primary border-2 border-border rounded-[10px] text-text-primary outline-none transition-colors focus:border-accent"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-3.5 text-[15px] font-semibold text-white rounded-[10px] whitespace-nowrap transition-transform active:scale-95"
          style={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          }}
        >
          Guess
        </button>
      </div>
      {showHint && (
        <div className="text-center text-xs text-text-dim mt-3">
          💡 Shortcuts: 5k = 5,000 &middot; 2m = 2,000,000 &middot; 1.5b =
          1,500,000,000
        </div>
      )}
    </div>
  );
}
