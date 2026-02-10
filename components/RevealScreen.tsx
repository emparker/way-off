"use client";

import { Guess, Question } from "@/types";
import { formatNum, MAX_GUESSES } from "@/lib/game-logic";
import ShareButton from "./ShareButton";

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
          : "Answer not found"}
      </div>

      {/* Question */}
      <h2 className="text-lg font-medium text-[#94A3B8] mb-4 leading-[1.4]">
        {question.question}
      </h2>

      {/* The Big Answer */}
      <div className="text-[52px] font-extrabold text-text-primary mb-1 animate-popIn tracking-tight">
        {formatNum(question.answer)}
      </div>
      <div className="text-base text-text-muted mb-7 uppercase tracking-[2px]">
        {question.unit}
      </div>

      {/* Explanation Card */}
      <div className="bg-bg-secondary rounded-[14px] p-5 text-left mb-6 border border-border animate-fadeSlideIn [animation-delay:0.2s] [animation-fill-mode:both]">
        <div className="text-xs text-accent font-semibold mb-2 uppercase tracking-wider">
          💡 Did you know?
        </div>
        <p className="text-[15px] leading-[1.6] text-text-secondary m-0">
          {question.explanation}
        </p>
      </div>

      {/* Emoji Trail */}
      <div className="flex justify-center gap-2 mb-6 text-[28px]">
        {guesses.map((g, i) => (
          <span
            key={i}
            className="animate-popIn [animation-fill-mode:both]"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {g.feedback.emoji}
          </span>
        ))}
        {!solved && (
          <span
            className="animate-popIn [animation-fill-mode:both]"
            style={{ animationDelay: `${guesses.length * 0.1}s` }}
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
    </div>
  );
}
