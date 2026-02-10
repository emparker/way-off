import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  {
    id: 1,
    question: "How long is 1 billion seconds?",
    answer: 31.7,
    unit: "years",
    explanation: "There are about 31.5 million seconds in a year, making 1 billion seconds roughly 31.7 years. Most people guess thousands!",
    category: "TIME",
  },
  {
    id: 2,
    question: "How many times does the average human heart beat in one day?",
    answer: 100000,
    unit: "beats",
    explanation: "Your heart beats about 100,000 times every single day — that's roughly 70 beats per minute, all day, every day.",
    category: "HUMAN BODY",
  },
  {
    id: 3,
    question: "How many photos are taken worldwide every day?",
    answer: 1400000000,
    unit: "photos",
    explanation: "Roughly 1.4 billion photos are taken every day worldwide. That's about 16,000 photos every second.",
    category: "SCALE",
  },
];

const MAX_GUESSES = 5;

function getFeedback(guess, answer) {
  const pctOff = Math.abs(guess - answer) / answer;
  const direction = guess < answer ? "higher" : "lower";
  if (pctOff <= 0.02) return { level: "exact", emoji: "✅", color: "#10B981", label: "Nailed it!", direction: null };
  if (pctOff <= 0.05) return { level: "hot", emoji: "🔥", color: "#EF4444", label: "Very hot!", direction };
  if (pctOff <= 0.20) return { level: "warm", emoji: "🌡️", color: "#F59E0B", label: "Warm", direction };
  return { level: "cold", emoji: "❄️", color: "#3B82F6", label: "Cold", direction };
}

function formatNum(n) {
  if (n === null || n === undefined) return "";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function parseInput(val) {
  const s = val.trim().toLowerCase().replace(/,/g, "");
  if (s.endsWith("b")) return parseFloat(s) * 1e9;
  if (s.endsWith("m")) return parseFloat(s) * 1e6;
  if (s.endsWith("k")) return parseFloat(s) * 1e3;
  return parseFloat(s);
}

function ProgressBar({ pctOff, feedback }) {
  const clampPct = Math.min(pctOff * 100, 100);
  const fillPct = 100 - clampPct;
  return (
    <div style={{ width: "100%", height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.max(fillPct, 3)}%`,
          height: "100%",
          background: feedback.color,
          borderRadius: 4,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("play");
  const [qIndex, setQIndex] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState("");
  const [solved, setSolved] = useState(false);
  const [revealAnim, setRevealAnim] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const inputRef = useRef(null);

  const q = QUESTIONS[qIndex];

  useEffect(() => {
    if (screen === "play" && inputRef.current) inputRef.current.focus();
  }, [screen, guesses]);

  const handleGuess = () => {
    const num = parseInput(input);
    if (isNaN(num) || num < 0) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }
    const fb = getFeedback(num, q.answer);
    const pctOff = Math.abs(num - q.answer) / q.answer;
    const newGuesses = [...guesses, { value: num, feedback: fb, pctOff }];
    setGuesses(newGuesses);
    setInput("");

    if (fb.level === "exact" || fb.level === "hot" && pctOff <= 0.02) {
      setSolved(true);
      setTimeout(() => {
        setRevealAnim(true);
        setScreen("reveal");
      }, 600);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => {
        setRevealAnim(true);
        setScreen("reveal");
      }, 600);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGuess();
  };

  const shareText = () => {
    const name = "🎯 Daily Game";
    const emojis = guesses.map((g) => g.feedback.emoji).join(" ");
    const firstOff = guesses[0] ? Math.abs(guesses[0].value - q.answer) : 0;
    const result = solved ? `${emojis}` : `${emojis} ❌`;
    return `${name} #${q.id}\n\n${result}\n\nOff by ${formatNum(firstOff)} ${q.unit} at first 😅`;
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleNext = () => {
    const next = (qIndex + 1) % QUESTIONS.length;
    setQIndex(next);
    setGuesses([]);
    setInput("");
    setSolved(false);
    setRevealAnim(false);
    setCopied(false);
    setScreen("play");
  };

  const gameOver = guesses.length >= MAX_GUESSES || solved;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      color: "#F8FAFC",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        padding: "20px 20px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ fontSize: 13, color: "#64748B", letterSpacing: 1, textTransform: "uppercase" }}>
          Daily Game
        </div>
        <div style={{ fontSize: 13, color: "#64748B" }}>
          #{q.id} · {q.category}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 480, padding: "0 20px" }}>

        {screen === "play" && (
          <div style={{ paddingTop: 32 }}>
            {/* Question */}
            <h2 style={{
              fontSize: 22,
              fontWeight: 600,
              lineHeight: 1.4,
              marginBottom: 8,
              textAlign: "center",
            }}>
              {q.question}
            </h2>
            <div style={{
              textAlign: "center",
              fontSize: 13,
              color: "#94A3B8",
              marginBottom: 32,
            }}>
              Answer in <strong style={{ color: "#CBD5E1" }}>{q.unit}</strong> · {MAX_GUESSES - guesses.length} guess{MAX_GUESSES - guesses.length !== 1 ? "es" : ""} left
            </div>

            {/* Guess History */}
            <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {guesses.map((g, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "#1E293B",
                  borderRadius: 10,
                  border: `1px solid ${g.feedback.color}33`,
                  animation: "fadeSlideIn 0.3s ease",
                }}>
                  <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{g.feedback.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{formatNum(g.value)}</span>
                      <span style={{
                        fontSize: 12,
                        color: g.feedback.color,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        {g.feedback.label}
                        {g.feedback.direction && (
                          <span style={{ fontSize: 14 }}>
                            {g.feedback.direction === "higher" ? "⬆️" : "⬇️"}
                          </span>
                        )}
                      </span>
                    </div>
                    <ProgressBar pctOff={g.pctOff} feedback={g.feedback} />
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {!gameOver && (
              <div style={{
                display: "flex",
                gap: 10,
                animation: shakeInput ? "shake 0.4s ease" : "none",
              }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter a number (e.g. 42, 5k, 1.2m)`}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      fontSize: 16,
                      background: "#0F172A",
                      border: "2px solid #334155",
                      borderRadius: 10,
                      color: "#F8FAFC",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#6366F1"}
                    onBlur={(e) => e.target.style.borderColor = "#334155"}
                  />
                </div>
                <button
                  onClick={handleGuess}
                  style={{
                    padding: "14px 24px",
                    fontSize: 15,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "transform 0.1s, opacity 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseDown={(e) => e.target.style.transform = "scale(0.96)"}
                  onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                >
                  Guess
                </button>
              </div>
            )}

            {/* Shorthand hint */}
            {!gameOver && guesses.length === 0 && (
              <div style={{
                textAlign: "center",
                fontSize: 12,
                color: "#475569",
                marginTop: 12,
              }}>
                💡 Shortcuts: 5k = 5,000 · 2m = 2,000,000 · 1.5b = 1,500,000,000
              </div>
            )}

            {/* Game Over - Go to Reveal */}
            {gameOver && (
              <button
                onClick={() => { setRevealAnim(true); setScreen("reveal"); }}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: 16,
                  fontWeight: 600,
                  background: solved
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  marginTop: 8,
                }}
              >
                {solved ? "🎉 See the Answer!" : "See the Answer →"}
              </button>
            )}
          </div>
        )}

        {screen === "reveal" && (
          <div style={{
            paddingTop: 32,
            animation: "fadeIn 0.5s ease",
            textAlign: "center",
          }}>
            {/* Result Badge */}
            <div style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
              background: solved ? "#10B98122" : "#EF444422",
              color: solved ? "#10B981" : "#EF4444",
              border: `1px solid ${solved ? "#10B98144" : "#EF444444"}`,
            }}>
              {solved ? `Solved in ${guesses.length}/${MAX_GUESSES} guesses!` : `Answer not found`}
            </div>

            {/* Question */}
            <h2 style={{ fontSize: 18, fontWeight: 500, color: "#94A3B8", marginBottom: 16, lineHeight: 1.4 }}>
              {q.question}
            </h2>

            {/* The Big Answer */}
            <div style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#F8FAFC",
              marginBottom: 4,
              animation: "popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
              letterSpacing: -1,
            }}>
              {formatNum(q.answer)}
            </div>
            <div style={{
              fontSize: 16,
              color: "#64748B",
              marginBottom: 28,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}>
              {q.unit}
            </div>

            {/* Explanation Card */}
            <div style={{
              background: "#1E293B",
              borderRadius: 14,
              padding: "20px 20px",
              textAlign: "left",
              marginBottom: 24,
              border: "1px solid #334155",
              animation: "fadeSlideIn 0.6s ease 0.2s both",
            }}>
              <div style={{ fontSize: 12, color: "#6366F1", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                💡 Did you know?
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "#CBD5E1", margin: 0 }}>
                {q.explanation}
              </p>
            </div>

            {/* Emoji Trail */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginBottom: 24,
              fontSize: 28,
            }}>
              {guesses.map((g, i) => (
                <span key={i} style={{
                  animation: `popIn 0.3s ease ${i * 0.1}s both`,
                }}>{g.feedback.emoji}</span>
              ))}
              {!solved && <span style={{ animation: `popIn 0.3s ease ${guesses.length * 0.1}s both` }}>❌</span>}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 16,
                fontWeight: 600,
                background: copied ? "#10B981" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginBottom: 12,
              }}
            >
              {copied ? "✓ Copied to clipboard!" : "📋 Share Result"}
            </button>

            {/* Share Preview */}
            <div style={{
              background: "#0F172A",
              borderRadius: 10,
              padding: 16,
              fontSize: 13,
              fontFamily: "monospace",
              color: "#64748B",
              textAlign: "left",
              lineHeight: 1.8,
              whiteSpace: "pre-line",
              marginBottom: 24,
              border: "1px solid #1E293B",
            }}>
              {shareText()}
            </div>

            {/* Next Question (Demo) */}
            <button
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: 14,
                fontWeight: 500,
                background: "transparent",
                color: "#6366F1",
                border: "2px solid #6366F1",
                borderRadius: 12,
                cursor: "pointer",
                marginBottom: 32,
              }}
            >
              Try Next Question (Demo) →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5); }
          70% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        input::placeholder {
          color: #475569;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
