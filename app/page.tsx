import Header from "@/components/Header";
import GameBoard from "@/components/GameBoard";
import { getTodayQuestion } from "@/lib/questions";

export default function Home() {
  const question = getTodayQuestion();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header
        questionNumber={question.questionNumber}
        category={question.category}
      />
      <div className="w-full max-w-game px-5">
        <GameBoard question={question} />
      </div>
    </main>
  );
}
