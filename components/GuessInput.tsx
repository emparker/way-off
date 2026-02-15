"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { parseInput } from "@/lib/game-logic";

type Suffix = "k" | "m" | "b" | "t";

interface GuessInputProps {
  onGuess: (value: number) => void;
  disabled: boolean;
  showHint: boolean;
  focusTrigger?: number;
}

const SUFFIXES: { key: Suffix; label: string }[] = [
  { key: "k", label: "Thousand" },
  { key: "m", label: "Million" },
  { key: "b", label: "Billion" },
  { key: "t", label: "Trillion" },
];

export default function GuessInput({
  onGuess,
  disabled,
  showHint,
  focusTrigger = 0,
}: GuessInputProps) {
  const [input, setInput] = useState("");
  const [suffix, setSuffix] = useState<Suffix | null>(null);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) inputRef.current.focus();
  }, [disabled, focusTrigger]);

  // Combine typed input with selected suffix for parsing
  const resolvedInput = useMemo(() => {
    const trimmed = input.trim().toLowerCase();
    const hasLetterSuffix = /[kmbt]$/i.test(trimmed);
    return suffix && !hasLetterSuffix ? input + suffix : input;
  }, [input, suffix]);

  // Live preview of expanded number
  const preview = useMemo(() => {
    if (!input.trim()) return null;
    const num = parseInput(resolvedInput);
    if (num === null || num < 0 || isNaN(num)) return null;
    return num.toLocaleString();
  }, [input, resolvedInput]);

  const handleSubmit = () => {
    const num = parseInput(resolvedInput);
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

  const toggleSuffix = (s: Suffix) => {
    setSuffix((prev) => (prev === s ? null : s));
    inputRef.current?.focus();
  };

  if (disabled) return null;

  return (
    <div>
      <div className={`flex gap-2.5 ${shaking ? "animate-shake" : ""}`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          aria-label="Enter your guess"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Enter a number"
          className="flex-1 px-4 py-3.5 text-base bg-bg-primary border-2 border-border rounded-[10px] text-text-primary outline-none transition-colors focus:border-accent"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className={`px-6 py-3.5 text-[15px] font-semibold text-white rounded-[10px] whitespace-nowrap transition-transform active:scale-95 ${input.trim() ? "animate-pulseGlow" : ""}`}
          style={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          }}
        >
          Guess
        </button>
      </div>

      {/* Magnitude suffix buttons */}
      <div className="flex items-center gap-2.5 mt-2.5">
        {SUFFIXES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleSuffix(key)}
            className={`px-4 py-2 min-h-[44px] text-sm font-semibold rounded-lg transition-all active:scale-95 ${
              suffix === key
                ? "text-white shadow-md"
                : "bg-bg-primary border border-border text-text-secondary hover:border-accent"
            }`}
            style={
              suffix === key
                ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }
                : undefined
            }
            aria-pressed={suffix === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Live preview of expanded value */}
      {preview && suffix && (
        <div className="text-center text-sm text-text-secondary mt-1.5 animate-fadeIn">
          = {preview}
        </div>
      )}

      {/* First-guess hint */}
      {showHint && (
        <div className="text-center text-xs text-text-dim mt-2.5">
          Use the buttons below to set magnitude — no need to type zeros
        </div>
      )}
    </div>
  );
}
