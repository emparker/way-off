"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Question, Guess, ActiveGuess, TimedOutGuess, GameResult } from "@/types";
import { getFeedback, getLogDistance, isWinningFeedback, MAX_GUESSES, GUESS_TIMER_MS } from "@/lib/game-logic";
import {
  CookieGameState,
  getGameState,
  setGameState,
  genVisitorId,
} from "@/lib/cookies";

function wasYesterday(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00Z");
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return d.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0];
}

function rehydrateGuesses(rawValues: number[], answer: number): Guess[] {
  return rawValues.map((value) => {
    if (value === -1) {
      return {
        timedOut: true,
        value: null,
        feedback: null,
        logDistance: null,
        responseTime: GUESS_TIMER_MS,
        timestamp: 0,
      } as TimedOutGuess;
    }
    return {
      timedOut: false,
      value,
      feedback: getFeedback(value, answer),
      logDistance: getLogDistance(value, answer),
      responseTime: 0,
      timestamp: 0,
    } as ActiveGuess;
  });
}

interface PersistedGameState {
  guesses: Guess[];
  result: GameResult;
  screen: "ready" | "play" | "reveal";
  streak: number;
  longestStreak: number;
  gamesPlayed: number;
}

export function usePersistedGame(question: Question) {
  const [state, setState] = useState<PersistedGameState>({
    guesses: [],
    result: "playing",
    screen: "ready",
    streak: 0,
    longestStreak: 0,
    gamesPlayed: 0,
  });
  const cookieRef = useRef<CookieGameState | null>(null);

  // Hydrate from cookie on mount
  useEffect(() => {
    const questionDate = question.date;
    const saved = getGameState();

    let visitorId = saved?.v ?? genVisitorId();
    let streak = saved?.sk ?? 0;
    let longestStreak = saved?.sl ?? 0;
    let gamesPlayed = saved?.gp ?? 0;

    // Handle the 5 hydration states
    if (saved && saved.d === questionDate) {
      // Same day — restore state
      const guesses = rehydrateGuesses(saved.g, question.answer);
      const result: GameResult =
        saved.r === "w" ? "win" : saved.r === "l" ? "loss" : "playing";
      const screen = result !== "playing" ? "reveal" : guesses.length > 0 ? "play" : "ready";

      cookieRef.current = saved;
      setState({ guesses, result, screen, streak, longestStreak, gamesPlayed });
      return;
    }

    // Different day or no cookie — check streak continuity
    if (saved && saved.ld) {
      if (!wasYesterday(saved.ld)) {
        streak = 0;
      }
    }

    // Start fresh game
    const fresh: CookieGameState = {
      v: visitorId,
      d: questionDate,
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
      screen: "ready",
      streak,
      longestStreak,
      gamesPlayed,
    });
  }, [question.date, question.answer]);

  const writeCookie = useCallback(
    (newGuesses: Guess[], newResult: GameResult, sk: number, sl: number, gp: number) => {
      const cookie: CookieGameState = {
        v: cookieRef.current?.v ?? genVisitorId(),
        d: question.date,
        g: newGuesses.map((g) => (g.timedOut ? -1 : g.value)),
        r: newResult === "win" ? "w" : newResult === "loss" ? "l" : "p",
        sk,
        sl,
        gp,
        ld: newResult !== "playing" ? question.date : cookieRef.current?.ld ?? "",
      };
      cookieRef.current = cookie;
      setGameState(cookie);
    },
    [question.date]
  );

  const handleGuess = useCallback(
    (value: number, responseTime: number) => {
      const feedback = getFeedback(value, question.answer);
      const logDist = getLogDistance(value, question.answer);
      const guess: ActiveGuess = {
        timedOut: false,
        value,
        feedback,
        logDistance: logDist,
        responseTime,
        timestamp: Date.now(),
      };

      setState((prev) => {
        const newGuesses = [...prev.guesses, guess];
        let newResult: GameResult = "playing";
        let newScreen = prev.screen;
        let sk = prev.streak;
        let sl = prev.longestStreak;
        let gp = prev.gamesPlayed;

        if (isWinningFeedback(feedback.level)) {
          newResult = "win";
          sk += 1;
          sl = Math.max(sl, sk);
          gp += 1;
        } else if (newGuesses.length >= MAX_GUESSES) {
          newResult = "loss";
          sk = 0;
          gp += 1;
        }

        writeCookie(newGuesses, newResult, sk, sl, gp);

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
    [question.answer, writeCookie]
  );

  const handleTimeout = useCallback(() => {
    const guess: TimedOutGuess = {
      timedOut: true,
      value: null,
      feedback: null,
      logDistance: null,
      responseTime: GUESS_TIMER_MS,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const newGuesses = [...prev.guesses, guess];
      let newResult: GameResult = "playing";
      let newScreen = prev.screen;
      let sk = prev.streak;
      let sl = prev.longestStreak;
      let gp = prev.gamesPlayed;

      if (newGuesses.length >= MAX_GUESSES) {
        newResult = "loss";
        sk = 0;
        gp += 1;
      }

      writeCookie(newGuesses, newResult, sk, sl, gp);

      return {
        guesses: newGuesses,
        result: newResult,
        screen: newScreen,
        streak: sk,
        longestStreak: sl,
        gamesPlayed: gp,
      };
    });
  }, [writeCookie]);

  const handleReady = useCallback(() => {
    setState((prev) => ({ ...prev, screen: "play" }));
  }, []);

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
    handleTimeout,
    handleReady,
    handleReveal,
  };
}
