import { ShoppingBag, Plus, Minus, Trash2, Send, Shuffle } from "lucide-react";

export default function OrderPanel({
  mood, cartItems, toppings, selectedToppings, container, note,
  onUpdateQty, onRemove, onContainer, onToggleTopping, onNote, onPlace, onSurprise, total,
}) {
  const hasItems = cartItems.length > 0;
  const totalScoops = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="glass-strong" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <ShoppingBag size={18} /> Your Cup
          </h3>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,.5)", marginTop: 2 }}>
            {mood.emoji} {mood.name} — {mood.line}
          </p>
        </div>
        <span className="badge">{totalScoops} scoop{totalScoops !== 1 ? "s" : ""}</span>
      </div>

      {/* Cart items */}
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        {!hasItems ? (
          <div style={{ textAlign: "center", padding: "24px 12px", color: "rgba(0,0,0,.4)", fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍦</div>
            Pick flavours from the menu!
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="anim-slide" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(255,255,255,.6)", borderRadius: 14, padding: "10px 12px",
              border: "1px solid rgba(0,0,0,.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 18 }}>{item.emoji}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(0,0,0,.5)" }}>{item.qty} × ${item.price.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                <button onClick={() => onUpdateQty(item.id, -1)} className="btn btn-ghost" style={{ padding: "6px 8px", minWidth: 0, borderRadius: 10 }}><Minus size={12} /></button>
                <span style={{ fontSize: 14, fontWeight: 800, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="btn btn-ghost" style={{ padding: "6px 8px", minWidth: 0, borderRadius: 10 }}><Plus size={12} /></button>
                <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", padding: 6, color: "rgba(0,0,0,.3)", transition: "color .2s" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Container */}
      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>Container</label>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[["cup", "🥤 Cup"], ["cone", "🍦 Cone"], ["waffle", "🧇 Waffle"]].map(([v, l]) => (
            <button key={v} className="btn" onClick={() => onContainer(v)} style={{
              flex: 1, fontSize: 12, padding: "10px 8px",
              background: container === v ? "var(--pink)" : "rgba(255,255,255,.6)",
              color: container === v ? "#fff" : "#555",
              border: container === v ? "1.5px solid var(--pink)" : "1.5px solid rgba(0,0,0,.06)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Toppings */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>Toppings</label>
          <span style={{ fontSize: 11, color: "rgba(0,0,0,.4)" }}>{selectedToppings.length} selected</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {toppings.map((t) => {
            const on = selectedToppings.includes(t.id);
            return (
              <button key={t.id} className="btn" onClick={() => onToggleTopping(t.id)} style={{
                fontSize: 12, padding: "8px 12px",
                background: on ? "#1a1a2e" : "rgba(255,255,255,.6)",
                color: on ? "#fff" : "#555",
                border: on ? "1.5px solid #1a1a2e" : "1.5px solid rgba(0,0,0,.06)",
              }}>
                {t.emoji} {t.name}
                <span style={{ opacity: on ? 0.8 : 0.5, marginLeft: 2 }}>+${t.price.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>Special Request</label>
        <textarea rows={2} placeholder="e.g. extra sprinkles please 🌈" value={note} onChange={(e) => onNote(e.target.value)} style={{ marginTop: 6, resize: "none" }} />
      </div>

      {/* Total */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>${total.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: "rgba(0,0,0,.4)", fontWeight: 600 }}>pretend price</div>
        </div>
        <span className="badge" style={{ background: "#FFF0E5", color: "#FF8A65" }}>🍦 pretend</span>
      </div>

      <button className="btn btn-primary" disabled={!hasItems} onClick={onPlace} style={{
        width: "100%", marginTop: 12, padding: 14, fontSize: 15,
        background: hasItems ? "linear-gradient(135deg,#FF6B8A,#FF8FA3)" : undefined,
      }}>
        <Send size={16} /> Place Pretend Order 🍦
      </button>
      <button className="btn btn-ghost" onClick={onSurprise} style={{ width: "100%", marginTop: 8, fontSize: 13 }}>
        <Shuffle size={14} /> Surprise Me! 🎲
      </button>
    </div>
  );
}
