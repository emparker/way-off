"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Question } from "@/types";
import { MAX_GUESSES, getTimerMs } from "@/lib/game-logic";
import { usePersistedGame } from "@/hooks/usePersistedGame";
import QuestionDisplay from "./QuestionDisplay";
import GuessHistory from "./GuessHistory";
import GuessInput from "./GuessInput";
import GuessTimer from "./GuessTimer";
import ReadyScreen from "./ReadyScreen";
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
    handleTimeout,
    handleReady,
    handleReveal,
  } = usePersistedGame(question);

  const [timerRunning, setTimerRunning] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const timerStartRef = useRef<number>(0);
  const delayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const startTimer = useCallback(() => {
    setTimerRunning(true);
    timerStartRef.current = Date.now();
    setFocusTrigger((n) => n + 1);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = undefined;
    }
  }, []);

  // Timer lifecycle: start after each guess or after ready
  useEffect(() => {
    if (screen !== "play" || gameOver) {
      stopTimer();
      return;
    }

    // Delay before starting timer: 300ms after ready, 500ms between guesses
    const delay = guesses.length === 0 ? 300 : 500;
    delayRef.current = setTimeout(startTimer, delay);

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = undefined;
      }
    };
  }, [guesses.length, screen, gameOver, startTimer, stopTimer]);

  const onGuessWithTime = useCallback(
    (value: number) => {
      const responseTime = Date.now() - timerStartRef.current;
      stopTimer();
      handleGuess(value, responseTime);
    },
    [handleGuess, stopTimer]
  );

  const onTimeout = useCallback(() => {
    stopTimer();
    handleTimeout();
  }, [handleTimeout, stopTimer]);

  if (screen === "ready") {
    return (
      <ReadyScreen
        questionNumber={question.questionNumber}
        category={question.category}
        onReady={handleReady}
      />
    );
  }

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

      {guesses.length > 0 && (
        <div className="mt-8">
          <GuessHistory guesses={guesses} gameOver={gameOver} />
        </div>
      )}

      <div className="mb-3">
        <GuessTimer
          running={timerRunning}
          durationMs={getTimerMs(guesses.length)}
          onTimeout={onTimeout}
        />
      </div>

      <GuessInput
        onGuess={onGuessWithTime}
        disabled={gameOver || !timerRunning}
        showHint={guesses.length === 0}
        focusTrigger={focusTrigger}
        timerRunning={timerRunning}
      />

      {gameOver && screen === "play" && (
        <button
          type="button"
          onClick={handleReveal}
          className="w-full py-4 text-base font-semibold text-white rounded-xl mt-2 transition-transform active:scale-95 animate-fadeSlideIn [animation-delay:0.3s] [animation-fill-mode:both]"
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
