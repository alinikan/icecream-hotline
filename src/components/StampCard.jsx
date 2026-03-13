import { Sparkles, Crown } from "lucide-react";
import { STAMP_EMOJIS, STAMPS_TO_UNLOCK } from "../data/flavours.js";

export default function StampCard({ stamps }) {
  const total = STAMPS_TO_UNLOCK;
  const filled = Math.min(stamps, total);

  return (
    <div className="glass" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <Crown size={16} style={{ color: "var(--gold)" }} /> Stamp Card
          </h3>
          <p style={{ fontSize: 13, color: "rgba(0,0,0,.55)", marginTop: 2 }}>
            <b>{total}</b> stamps unlock the legendary <b>Chocolate Chip Cookie</b> ✨
          </p>
        </div>
        <span className="badge">
          {filled}/{total}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 10, marginTop: 14 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={i < filled ? "anim-pop" : ""}
            style={{
              height: 60,
              borderRadius: 18,
              background: i < filled ? "linear-gradient(135deg,#FFE4EC,#FFF0F5)" : "rgba(255,255,255,.5)",
              border: i < filled ? "1.5px solid var(--pink)" : "1.5px solid rgba(0,0,0,.06)",
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              boxShadow: i < filled ? "0 4px 12px rgba(255,107,138,.15)" : "none",
              animationDelay: `${i * 0.08}s`,
            }}
          >
            {i < filled ? STAMP_EMOJIS[i] : <span style={{ opacity: 0.3 }}>·</span>}
          </div>
        ))}
      </div>

      {stamps >= total && (
        <div
          className="anim-pop"
          style={{
            marginTop: 14,
            padding: "12px 16px",
            borderRadius: 16,
            background: "linear-gradient(135deg,#FFD700,#FFA500)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Sparkles size={16} /> Unlocked: Chocolate Chip Cookie!
        </div>
      )}
    </div>
  );
}
