"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Guess, Question } from "@/types";
import { formatNum, MAX_GUESSES } from "@/lib/game-logic";
import ShareButton from "./ShareButton";

const LOSS_MESSAGES = [
  "Way off! But there's always tomorrow.",
  "Not today — but now you know!",
  "Whoa, that's wild. Come back tomorrow!",
  "Your gut lied to you. It happens.",
  "Reality is stranger than fiction.",
  "Brain vs. reality: reality wins this round.",
  "So close yet so far. See you tomorrow!",
  "Numbers are weird. Try again tomorrow.",
];

function Countdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="text-center text-sm text-text-muted mt-2 animate-fadeIn">
      Next question in <span className="font-mono text-text-secondary tabular-nums">{timeLeft}</span>
    </div>
  );
}

interface RevealScreenProps {
  question: Question;
  guesses: Guess[];
  solved: boolean;
}

export default function RevealScreen({
  question,
  guesses,
  solved,
}: RevealScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  const lossMessage = useMemo(
    () => LOSS_MESSAGES[question.questionNumber % LOSS_MESSAGES.length],
    [question.questionNumber]
  );

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="pt-8 animate-fadeIn text-center">
      {/* Result Badge */}
      <div
        className="inline-block px-4 py-1.5 rounded-full text-[13px] font-semibold mb-6"
        style={{
          background: solved ? "#10B98122" : "#EF444422",
          color: solved ? "#10B981" : "#EF4444",
          border: `1px solid ${solved ? "#10B98144" : "#EF444444"}`,
        }}
      >
        {solved
          ? `Solved in ${guesses.length}/${MAX_GUESSES} guesses!`
          : lossMessage}
      </div>

      {/* Question */}
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[20px] font-semibold text-text-secondary mb-5 leading-[1.4] outline-none"
      >
        {question.question}
      </h2>

      {/* The Big Answer */}
      <div
        className="text-[52px] font-extrabold mb-1 animate-popIn tracking-[-0.03em] leading-none tabular-nums"
        style={{ color: solved ? "#10B981" : "#F8FAFC" }}
      >
        {formatNum(question.answer)}
      </div>
      <div className="text-base text-text-secondary mb-7 uppercase tracking-[2px]">
        {question.unit}
      </div>

      {/* Explanation Card */}
      <div className="bg-bg-secondary rounded-[14px] p-5 text-left mb-6 border border-border animate-fadeSlideIn [animation-delay:0.2s] [animation-fill-mode:both]">
        <div className="text-xs text-accent font-semibold mb-2 uppercase tracking-wider">
          <span role="img" aria-hidden="true">💡</span> Did you know?
        </div>
        <p className="text-[15px] leading-[1.6] text-text-secondary m-0">
          {question.explanation}
        </p>
      </div>

      {/* Emoji Trail */}
      <div className="flex justify-center gap-2 mb-6 text-[28px]" aria-label="Your guesses">
        {guesses.map((g, i) => (
          <span
            key={i}
            className="animate-popIn [animation-fill-mode:both]"
            style={{ animationDelay: `${i * 0.1}s` }}
            role="img"
            aria-label={g.timedOut ? "Timed out" : g.feedback.label}
          >
            {g.timedOut ? "⏰" : g.feedback.emoji}
          </span>
        ))}
        {!solved && (
          <span
            className="animate-popIn [animation-fill-mode:both]"
            style={{ animationDelay: `${guesses.length * 0.1}s` }}
            role="img"
            aria-label="Not solved"
          >
            ❌
          </span>
        )}
      </div>

      {/* Share */}
      <ShareButton
        questionNumber={question.questionNumber}
        guesses={guesses}
        solved={solved}
        answer={question.answer}
        unit={question.unit}
      />

      {/* Come back tomorrow */}
      <Countdown />
    </div>
  );
}
