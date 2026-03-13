import { useState } from "react";
import { Star, Plus, Check, Lock } from "lucide-react";
import { STAMPS_TO_UNLOCK } from "../data/flavours.js";

export default function FlavourCard({ f, isFav, isLocked, onFav, onAdd }) {
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (isLocked) return;
    onAdd(f);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  }

  return (
    <div
      style={{
        background: f.bg,
        borderRadius: 22,
        padding: "16px 16px 14px",
        border: f.legendary ? "2px solid var(--gold)" : "1.5px solid rgba(255,255,255,.7)",
        boxShadow: f.legendary ? "0 8px 24px rgba(255,215,0,.2)" : "0 6px 20px rgba(0,0,0,.04)",
        position: "relative",
        overflow: "hidden",
        transition: "transform .2s, box-shadow .2s",
      }}
    >
      {f.legendary && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: -28,
            transform: "rotate(45deg)",
            background: "linear-gradient(135deg,#FFD700,#FFA500)",
            color: "#fff",
            padding: "3px 34px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 1,
          }}
        >
          LEGENDARY
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 28 }}>{f.emoji}</div>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginTop: 6 }}>{f.name}</h3>
          <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            {f.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onFav(f.id); }}
          style={{
            background: "rgba(255,255,255,.7)",
            border: "1.5px solid rgba(0,0,0,.06)",
            borderRadius: 12,
            padding: "8px 10px",
            transition: "transform .2s",
            display: "grid",
            placeItems: "center",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {isFav ? <Star size={18} fill="#FFD700" color="#FFD700" /> : <Star size={18} color="#ccc" />}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(0,0,0,.6)" }}>
          ${f.price.toFixed(2)}/scoop
        </span>
        {isLocked ? (
          <button className="btn btn-ghost" disabled style={{ fontSize: 12 }}>
            <Lock size={13} /> {STAMPS_TO_UNLOCK} stamps
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            style={{
              fontSize: 13,
              padding: "10px 16px",
              background: justAdded ? "#4CAF50" : undefined,
              transition: "background .3s",
            }}
          >
            {justAdded ? <><Check size={14} /> Added!</> : <><Plus size={14} /> Add</>}
          </button>
        )}
      </div>
    </div>
  );
}
