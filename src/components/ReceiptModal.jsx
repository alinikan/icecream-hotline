import { X, Copy, Send } from "lucide-react";

export default function ReceiptModal({ open, onClose, receipt }) {
  if (!open || !receipt) return null;

  const lines = [
    "🍦 ICE CREAM HOTLINE RECEIPT 🍦",
    `For: ${receipt.profileName} ${receipt.profileAvatar}`,
    `Mood: ${receipt.mood}`,
    `Time: ${new Date(receipt.time).toLocaleString()}`,
    "",
    ...receipt.items.map((it) => `  ${it.emoji} ${it.name} × ${it.qty}`),
    `Container: ${receipt.container}`,
    receipt.toppingsText ? `Toppings: ${receipt.toppingsText}` : null,
    "",
    receipt.note ? `Note: ${receipt.note}` : null,
    "",
    `Total: $${receipt.total.toFixed(2)} (pretend)`,
    `Stamp earned! (${receipt.stampsNow} total)`,
    receipt.unlocked ? "🏆 UNLOCKED: Chocolate Chip Cookie!" : null,
  ]
    .filter(Boolean)
    .join("\n");

  async function handleCopy() {
    try { await navigator.clipboard.writeText(lines); } catch {}
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: "Ice Cream Order", text: lines }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div className="glass-strong anim-pop" style={{ position: "relative", maxWidth: 520, width: "100%", padding: 24, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Order received! ✅</h2>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,.5)", marginTop: 2 }}>A pretend receipt — but the vibes are real.</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "8px 12px" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ marginTop: 14, padding: 16, borderRadius: 16, background: "rgba(255,255,255,.7)", border: "1px solid rgba(0,0,0,.06)" }}>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,.75)", fontFamily: "'Quicksand', sans-serif", lineHeight: 1.6 }}>
            {lines}
          </pre>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="btn btn-primary" onClick={handleCopy} style={{ flex: 1, padding: 12 }}>
            <Copy size={14} /> Copy
          </button>
          <button className="btn btn-ghost" onClick={handleShare} style={{ flex: 1, padding: 12 }}>
            <Send size={14} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
