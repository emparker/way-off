interface HeaderProps {
  questionNumber: number;
  category: string;
}

export default function Header({ questionNumber, category }: HeaderProps) {
  return (
    <div className="w-full max-w-game flex justify-between items-center pt-5 px-5">
      <div className="text-[13px] text-text-muted tracking-widest uppercase">
        Guesstimate
      </div>
      <div className="text-[13px] text-text-muted">
        #{questionNumber} &middot; {category}
      </div>
    </div>
  );
}
