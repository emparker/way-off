import { Guess } from "@/types";
import { formatNum, getLogDistance } from "./game-logic";

/** Pick a loss reaction emoji based on how close the best guess was. */
function getLossEmoji(guesses: Guess[], answer: number): string {
  const activeGuesses = guesses.filter((g) => !g.timedOut);
  if (activeGuesses.length === 0) return "🫠";
  const bestDist = Math.min(...activeGuesses.map((g) => getLogDistance(g.value, answer)));
  if (bestDist <= 0.15) return "😢"; // close but didn't get it
  return "🫠"; // way off
}

export function generateShareText(
  questionNum: number,
  guesses: Guess[],
  solved: boolean,
  answer: number,
  unit: string,
  url: string
): string {
  const emojis = guesses
    .map((g) => (g.timedOut ? "⏰" : g.feedback.emoji))
    .join(" ");
  const result = solved ? emojis : `${emojis} ❌`;

  const lines: string[] = [
    `🎯 Way Off #${questionNum}`,
    "",
    result,
    "",
  ];

  // Avg response time (only for non-timed-out guesses with real response times)
  const validTimes = guesses
    .filter((g) => !g.timedOut && g.responseTime > 0)
    .map((g) => g.responseTime);
  if (validTimes.length > 0) {
    const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    lines.push(`Avg response: ${(avg / 1000).toFixed(1)}s`);
  }

  // "Off by" line — use first non-timed-out guess
  const firstReal = guesses.find((g) => !g.timedOut);
  if (firstReal) {
    const firstOff = Math.abs(firstReal.value - answer);
    // Exact win → 😅, close-enough win → 🎉, loss → contextual emoji
    const lastGuess = guesses[guesses.length - 1];
    const isCloseWin = solved && !lastGuess?.timedOut && lastGuess?.feedback?.level === "close";
    const reactionEmoji = !solved
      ? getLossEmoji(guesses, answer)
      : isCloseWin ? "🎉" : "🏆";
    lines.push(`Off by ${formatNum(firstOff)} ${unit} at first ${reactionEmoji}`);
  }

  lines.push(url);

  return lines.join("\n");
}
