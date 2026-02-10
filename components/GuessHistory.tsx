"use client";

import { Guess } from "@/types";
import GuessRow from "./GuessRow";

interface GuessHistoryProps {
  guesses: Guess[];
}

export default function GuessHistory({ guesses }: GuessHistoryProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 mb-6">
      {guesses.map((g, i) => (
        <GuessRow key={i} guess={g} />
      ))}
    </div>
  );
}
