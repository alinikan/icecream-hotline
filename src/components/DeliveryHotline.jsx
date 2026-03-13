import { useState } from "react";
import { Phone } from "lucide-react";

export default function DeliveryHotline() {
  const [ringing, setRinging] = useState(false);

  return (
    <div className="glass" style={{ padding: "20px 22px", background: "rgba(255,248,240,.85)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
        <Phone size={16} style={{ color: "var(--pink)" }} /> Actual Delivery?
      </h3>
      <p style={{ fontSize: 13, color: "rgba(0,0,0,.55)", marginTop: 6, lineHeight: 1.7 }}>
        Need the order to be <i>actually</i> delivered? Call my secretary and book an appointment at{" "}
        <a
          href="tel:7788378095"
          onClick={(e) => { e.preventDefault(); setRinging(true); }}
          style={{ fontWeight: 800, color: "var(--pink)", textDecoration: "underline", textDecorationStyle: "wavy" }}
        >
          778-837-8095
        </a>{" "}
        and I'll see if I have time <span style={{ fontSize: 12, opacity: 0.7 }}>(I do)</span>
      </p>

      {ringing && (
        <div
          className="anim-pop"
          style={{
            marginTop: 10, padding: "10px 14px", borderRadius: 14,
            background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)",
            border: "1px solid rgba(76,175,80,.2)",
            fontSize: 12, fontWeight: 600, color: "#2E7D32",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>📞</span>
          <span>Ring ring... The secretary (also me) is very busy (not really). Call anytime!</span>
        </div>
      )}
    </div>
  );
}
