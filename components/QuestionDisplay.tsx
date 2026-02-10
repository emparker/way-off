"use client";

interface QuestionDisplayProps {
  question: string;
  unit: string;
  guessesLeft: number;
}

export default function QuestionDisplay({
  question,
  unit,
  guessesLeft,
}: QuestionDisplayProps) {
  return (
    <div className="pt-8 text-center">
      <h2 className="text-[22px] font-semibold leading-[1.4] mb-2 text-text-primary">
        {question}
      </h2>
      <div className="text-[13px] text-[#94A3B8]">
        Answer in <strong className="text-text-secondary">{unit}</strong> &middot;{" "}
        {guessesLeft} guess{guessesLeft !== 1 ? "es" : ""} left
      </div>
    </div>
  );
}
