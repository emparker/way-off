import { Guess } from "@/types";
import { formatNum } from "./game-logic";

export function generateShareText(
  questionNum: number,
  guesses: Guess[],
  solved: boolean,
  answer: number,
  unit: string,
  url: string
): string {
  const emojis = guesses.map((g) => g.feedback.emoji).join(" ");
  const result = solved ? emojis : `${emojis} ❌`;
  const firstOff = guesses[0]
    ? Math.abs(guesses[0].value - answer)
    : 0;
  return `🎯 Guesstimate #${questionNum}\n\n${result}\n\nOff by ${formatNum(firstOff)} ${unit} at first 😅\n${url}`;
}
