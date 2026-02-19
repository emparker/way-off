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

export type FeedbackLevel = "exact" | "hot" | "warm" | "cool" | "cold";

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
}

export interface Feedback {
  level: FeedbackLevel;
  emoji: string;
  color: string;
  label: string;
  direction: Direction | null;
}

interface GuessBase {
  responseTime: number;
  timestamp: number;
}

export interface ActiveGuess extends GuessBase {
  timedOut: false;
  value: number;
  feedback: Feedback;
  logDistance: number;
}

export interface TimedOutGuess extends GuessBase {
  timedOut: true;
  value: null;
  feedback: null;
  logDistance: null;
}

export type Guess = ActiveGuess | TimedOutGuess;

export type GameResult = "playing" | "win" | "loss";
