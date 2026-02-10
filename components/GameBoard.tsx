"use client";

import { Question } from "@/types";
import { MAX_GUESSES } from "@/lib/game-logic";
import { usePersistedGame } from "@/hooks/usePersistedGame";
import QuestionDisplay from "./QuestionDisplay";
import GuessHistory from "./GuessHistory";
import GuessInput from "./GuessInput";
import RevealScreen from "./RevealScreen";

interface GameBoardProps {
  question: Question;
}

export default function GameBoard({ question }: GameBoardProps) {
  const {
    guesses,
    screen,
    solved,
    gameOver,
    handleGuess,
    handleReveal,
  } = usePersistedGame(question);

  if (screen === "reveal") {
    return (
      <RevealScreen
        question={question}
        guesses={guesses}
        solved={solved}
      />
    );
  }

  return (
    <div className="pt-0">
      <QuestionDisplay
        question={question.question}
        unit={question.unit}
        guessesLeft={MAX_GUESSES - guesses.length}
      />

      <div className="mt-8">
        <GuessHistory guesses={guesses} />
      </div>

      <GuessInput
        onGuess={handleGuess}
        disabled={gameOver}
        showHint={guesses.length === 0}
      />

      {gameOver && screen === "play" && (
        <button
          type="button"
          onClick={handleReveal}
          className="w-full py-4 text-base font-semibold text-white rounded-xl mt-2 transition-transform active:scale-95"
          style={{
            background: solved
              ? "linear-gradient(135deg, #10B981, #059669)"
              : "linear-gradient(135deg, #6366F1, #8B5CF6)",
          }}
        >
          {solved ? "🎉 See the Answer!" : "See the Answer →"}
        </button>
      )}
    </div>
  );
}
