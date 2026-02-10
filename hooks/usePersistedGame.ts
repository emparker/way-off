"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Question, Guess, GameResult } from "@/types";
import { getFeedback, getPctOff, MAX_GUESSES } from "@/lib/game-logic";
import {
  CookieGameState,
  getGameState,
  setGameState,
  genVisitorId,
} from "@/lib/cookies";

function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

function wasYesterday(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00Z");
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return d.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0];
}

function rehydrateGuesses(
  rawValues: number[],
  answer: number,
  hotRange?: number,
  warmRange?: number
): Guess[] {
  return rawValues.map((value) => ({
    value,
    feedback: getFeedback(value, answer, hotRange, warmRange),
    pctOff: getPctOff(value, answer),
    timestamp: 0,
  }));
}

interface PersistedGameState {
  guesses: Guess[];
  result: GameResult;
  screen: "play" | "reveal";
  streak: number;
  longestStreak: number;
  gamesPlayed: number;
}

export function usePersistedGame(question: Question) {
  const [state, setState] = useState<PersistedGameState>({
    guesses: [],
    result: "playing",
    screen: "play",
    streak: 0,
    longestStreak: 0,
    gamesPlayed: 0,
  });
  const cookieRef = useRef<CookieGameState | null>(null);

  // Hydrate from cookie on mount
  useEffect(() => {
    const today = getTodayUTC();
    const saved = getGameState();

    let visitorId = saved?.v ?? genVisitorId();
    let streak = saved?.sk ?? 0;
    let longestStreak = saved?.sl ?? 0;
    let gamesPlayed = saved?.gp ?? 0;

    // Handle the 5 hydration states
    if (saved && saved.d === today) {
      // Same day — restore state
      const guesses = rehydrateGuesses(saved.g, question.answer, question.hotRange, question.warmRange);
      const result: GameResult =
        saved.r === "w" ? "win" : saved.r === "l" ? "loss" : "playing";
      const screen = result !== "playing" ? "reveal" : "play";

      cookieRef.current = saved;
      setState({ guesses, result, screen, streak, longestStreak, gamesPlayed });
      return;
    }

    // Different day or no cookie — check streak continuity
    if (saved && saved.ld) {
      if (!wasYesterday(saved.ld)) {
        // Streak broken
        streak = 0;
      }
    }

    // Start fresh game
    const fresh: CookieGameState = {
      v: visitorId,
      d: today,
      g: [],
      r: "p",
      sk: streak,
      sl: longestStreak,
      gp: gamesPlayed,
      ld: saved?.ld ?? "",
    };
    cookieRef.current = fresh;
    setGameState(fresh);
    setState({
      guesses: [],
      result: "playing",
      screen: "play",
      streak,
      longestStreak,
      gamesPlayed,
    });
  }, [question.answer]);

  const handleGuess = useCallback(
    (value: number) => {
      const feedback = getFeedback(value, question.answer, question.hotRange, question.warmRange);
      const pctOff = getPctOff(value, question.answer);
      const guess: Guess = { value, feedback, pctOff, timestamp: Date.now() };

      setState((prev) => {
        const newGuesses = [...prev.guesses, guess];
        let newResult: GameResult = "playing";
        let newScreen = prev.screen;
        let sk = prev.streak;
        let sl = prev.longestStreak;
        let gp = prev.gamesPlayed;

        if (feedback.level === "exact") {
          newResult = "win";
          sk += 1;
          sl = Math.max(sl, sk);
          gp += 1;
          setTimeout(() => {
            setState((s) => ({ ...s, screen: "reveal" }));
          }, 600);
        } else if (newGuesses.length >= MAX_GUESSES) {
          newResult = "loss";
          sk = 0;
          gp += 1;
          setTimeout(() => {
            setState((s) => ({ ...s, screen: "reveal" }));
          }, 600);
        }

        // Write cookie
        const cookie: CookieGameState = {
          v: cookieRef.current?.v ?? genVisitorId(),
          d: getTodayUTC(),
          g: newGuesses.map((g) => g.value),
          r: newResult === "win" ? "w" : newResult === "loss" ? "l" : "p",
          sk,
          sl,
          gp,
          ld:
            newResult !== "playing"
              ? getTodayUTC()
              : cookieRef.current?.ld ?? "",
        };
        cookieRef.current = cookie;
        setGameState(cookie);

        return {
          guesses: newGuesses,
          result: newResult,
          screen: newScreen,
          streak: sk,
          longestStreak: sl,
          gamesPlayed: gp,
        };
      });
    },
    [question.answer]
  );

  const handleReveal = useCallback(() => {
    setState((prev) => ({ ...prev, screen: "reveal" }));
  }, []);

  return {
    guesses: state.guesses,
    result: state.result,
    screen: state.screen,
    streak: state.streak,
    longestStreak: state.longestStreak,
    gamesPlayed: state.gamesPlayed,
    solved: state.result === "win",
    gameOver: state.result !== "playing",
    handleGuess,
    handleReveal,
  };
}
