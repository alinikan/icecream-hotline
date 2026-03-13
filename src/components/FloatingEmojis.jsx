import { useMemo } from "react";

const EMOJIS = ["🍦","🍓","🍪","🧁","🍫","🍭","🫧","✨","🌈","☁️","🥭","🍋","🫐","🍵"];

export default function FloatingEmojis() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        startX: Math.random() * 100,
        startY: Math.random() * 100,
        dx: (Math.random() - 0.5) * 200,
        dy: (Math.random() - 0.5) * 200,
        rot: (Math.random() - 0.5) * 360,
        duration: 18 + Math.random() * 20,
        delay: Math.random() * 18,
        size: 14 + Math.random() * 14,
      })),
    []
  );

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            fontSize: p.size,
            opacity: 0,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            "--rot": `${p.rot}deg`,
            animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
