interface HeaderProps {
  questionNumber: number;
  category: string;
}

export default function Header({ questionNumber, category }: HeaderProps) {
  return (
    <header className="w-full max-w-game flex justify-between items-center pt-5 px-5">
      <div className="text-base font-semibold text-text-primary tracking-widest uppercase">
        Way Off
      </div>
      <div className="text-[13px] text-text-muted">
        #{questionNumber} &middot; {category}
      </div>
    </header>
  );
}
