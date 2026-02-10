export type Category =
  | "TIME"
  | "SCALE"
  | "HUMAN_BODY"
  | "SPACE"
  | "NATURE"
  | "POP_CULTURE"
  | "HISTORY"
  | "WILD_CARD";

export type Difficulty = "easy" | "medium" | "hard";

export type FeedbackLevel = "exact" | "hot" | "warm" | "cold";

export type Direction = "higher" | "lower";

export interface Question {
  _id: string;
  date: string;
  question: string;
  answer: number;
  unit: string;
  explanation: string;
  source: string;
  category: Category;
  difficulty: Difficulty;
  questionNumber: number;
  hotRange?: number;
  warmRange?: number;
}

export interface Feedback {
  level: FeedbackLevel;
  emoji: string;
  color: string;
  label: string;
  direction: Direction | null;
}

export interface Guess {
  value: number;
  feedback: Feedback;
  pctOff: number;
  timestamp: number;
}

export type GameResult = "playing" | "win" | "loss";

export interface GameState {
  date: string;
  guesses: Guess[];
  result: GameResult;
}
