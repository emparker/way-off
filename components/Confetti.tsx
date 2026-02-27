"use client";

import { useEffect, useState } from "react";

const COLORS = ["#10B981", "#6366F1", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#F8FAFC"];
const PARTICLE_COUNT = 50;

interface Particle {
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  drift: number;
  spin: number;
}

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 4 + Math.random() * 6,
    drift: (Math.random() - 0.5) * 60,
    spin: Math.random() * 360,
  }));
}

export default function Confetti() {
  const [particles] = useState(makeParticles);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    const id = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-50"
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 animate-confettiFall"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // Pass drift via CSS custom property
            "--confetti-drift": `${p.drift}px`,
            "--confetti-spin": `${p.spin}deg`,
          } as React.CSSProperties}
        >
          <div
            className="rounded-sm"
            style={{
              width: `${p.size}px`,
              height: `${p.size * 0.6}px`,
              background: p.color,
              transform: `rotate(${p.spin}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
