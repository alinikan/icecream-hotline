import { useState } from "react";
import { History, ChevronRight } from "lucide-react";

export default function OrderHistoryPanel({ history, onView }) {
  const [open, setOpen] = useState(false);

  if (!history.length) return null;

  return (
    <div className="glass" style={{ padding: "18px 22px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%", background: "none", border: "none",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          <History size={16} /> Order History
          <span className="badge" style={{ marginLeft: 4 }}>{history.length}</span>
        </h3>
        <ChevronRight size={16} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>

      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {history
            .slice()
            .reverse()
            .map((r, i) => (
              <div
                key={i}
                className="anim-fade-up"
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "rgba(255,255,255,.5)", borderRadius: 14, padding: "10px 14px",
                  border: "1px solid rgba(0,0,0,.05)", animationDelay: `${i * 0.05}s`,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.items.map((it) => it.emoji).join(" ")}</div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,.4)" }}>
                    {new Date(r.time).toLocaleDateString()} · ${r.total.toFixed(2)}
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => onView(r)}>
                  View
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
