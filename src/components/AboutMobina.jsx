import { useState } from "react";
import { ChevronRight } from "lucide-react";

const FACTS = [
  { emoji: "😈", text: "ظالم است", category: "شخصیت" },
  { emoji: "👥", text: "تیم داره (سعی کن طرف تیمش باشی)", category: "شخصیت" },
  { emoji: "🧠", text: "باهوش است", category: "شخصیت" },
  { emoji: "🍵", text: "ماچا دوست ندارد", category: "خوراکی" },
  { emoji: "🤨", text: "به هیچ‌چیز اعتماد نمیکند!", category: "شخصیت" },
  { emoji: "🎓", text: "اس اف یو بوده ولی فهمید کمیستری نمیخواد، رفت بی سی آی تی (بیزینس وومن)", category: "زندگی" },
  { emoji: "🫑", text: "فلفل دلمه‌ای سبز پایینش سه پایه باشه دوست داره", category: "خوراکی" },
  { emoji: "🍗", text: "مرغ دوست داره", category: "خوراکی" },
  { emoji: "🍣", text: "سوشی دوست نداره", category: "خوراکی" },
  { emoji: "🍚", text: "زرشک پلو با مرغ غذای مورد علاقه؛ بعدش قورمه سبزی (با گوشت پخته شه ولی گوشتشو نمیخوره)؛ بعدش ماکارونی (فقط مامان‌پز)", category: "خوراکی" },
  { emoji: "🤷‍♀️", text: "چیپس و اینارو خیلی نیست", category: "خوراکی" },
  { emoji: "♋", text: "متولد تیر", category: "زندگی" },
  { emoji: "🐥", text: "از جوجه میترسید. ولی منو یاد جوجه میندازه 🐥", category: "شخصیت" },
  { emoji: "🐶", text: "حیوون مورد علاقه: سگ", category: "شخصیت" },
  { emoji: "📱", text: "قبلا با تلفن حرف میزد راه میرفت. الان نه.", category: "زندگی" },
  { emoji: "💪", text: "پروتئین شیک دوست داره", category: "خوراکی" },
  { emoji: "🍦", text: "اسنک های مورد علاقه: بستنی، توت فرنگی با شکلات اب شده", category: "خوراکی" },
  { emoji: "🍉", text: "میوه های مورد علاقه: طالبی، هندونه، توت فرنگی، موز، بلوبری، گوجه سبز", category: "خوراکی" },
  { emoji: "🏎️", text: "سرعت دوست داره", category: "شخصیت" },
  { emoji: "👑", text: "من نظر میدم، اون تعیین میکنه (تئوری: آیا این گزینه برمیگردد به ظالم بودنش؟)", category: "شخصیت" },
  { emoji: "🎬", text: "فیلم جنایی دوست داره —> زیاد معرفی نکن، تنهایی میبینه", category: "زندگی" },
];

const CATEGORIES = [
  { id: "all", name: "همه", emoji: "✨" },
  { id: "شخصیت", name: "شخصیت", emoji: "🧸" },
  { id: "خوراکی", name: "خوراکی", emoji: "🍦" },
  { id: "زندگی", name: "زندگی", emoji: "🌸" },
];

const CARD_COLORS = [
  "#FFF0F5", "#FFF5EE", "#F0FFF4", "#FFF8E1", "#F3E5F5",
  "#E8F5E9", "#FFF3E0", "#E8EAF6", "#FCE4EC", "#FFFDE7",
  "#F1F8E9", "#FBE9E7", "#E0F7FA", "#FFF0F5", "#F9FBE7",
  "#EFEBE9", "#E1F5FE", "#F3E5F5", "#FFF8E1", "#E8F5E9",
  "#FFF3E0",
];

export default function AboutMobina({ isOpen, onToggle }) {
  const [filter, setFilter] = useState("all");
  const [revealedCards, setRevealedCards] = useState(new Set());

  const filtered = filter === "all" ? FACTS : FACTS.filter((f) => f.category === filter);

  function toggleCard(index) {
    setRevealedCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="glass"
        style={{
          width: "100%",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1.5px solid rgba(255,180,200,.3)",
          background: "rgba(255,240,245,.75)",
          textAlign: "right",
        }}
      >
        <ChevronRight size={18} style={{ color: "var(--pink)", transition: "transform .2s" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>درباره مبینا</span>
          <span style={{ fontSize: 22 }}>🐥</span>
        </div>
      </button>
    );
  }

  return (
    <div
      className="anim-fade-up"
      style={{
        borderRadius: 24,
        overflow: "hidden",
        border: "1.5px solid rgba(255,180,200,.3)",
        background: "linear-gradient(170deg, #FFF0F5 0%, #FFFBF7 40%, #F0FFF4 100%)",
        boxShadow: "0 12px 40px rgba(255,107,138,.08)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 22px 16px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(255,255,255,.6)",
            border: "1px solid rgba(0,0,0,.06)",
            borderRadius: 12,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: "#888",
          }}
        >
          ✕ بستن
        </button>

        <div style={{ fontSize: 44, marginBottom: 8 }}>🐥</div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 700,
            background: "linear-gradient(135deg, #FF6B8A, #FFAB91)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          درباره مبینا
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(0,0,0,.45)",
            fontWeight: 600,
            marginTop: 4,
            direction: "rtl",
          }}
        >
          چیزایی که یاد گرفتم و فراموش نمیکنم ✨
        </p>

        {/* Category filter */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className="btn"
              onClick={() => setFilter(c.id)}
              style={{
                fontSize: 12,
                padding: "7px 14px",
                background: filter === c.id ? "var(--pink)" : "rgba(255,255,255,.7)",
                color: filter === c.id ? "#fff" : "#666",
                border:
                  filter === c.id
                    ? "1.5px solid var(--pink)"
                    : "1.5px solid rgba(0,0,0,.06)",
                direction: "rtl",
              }}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fact cards */}
      <div style={{ padding: "4px 16px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
            gap: 10,
          }}
        >
          {filtered.map((fact, i) => {
            const globalIndex = FACTS.indexOf(fact);
            const revealed = revealedCards.has(globalIndex);
            const bgColor = CARD_COLORS[globalIndex % CARD_COLORS.length];

            return (
              <div
                key={globalIndex}
                className="anim-fade-up"
                onClick={() => toggleCard(globalIndex)}
                style={{
                  animationDelay: `${i * 0.04}s`,
                  borderRadius: 18,
                  padding: revealed ? "16px" : "16px",
                  background: revealed ? bgColor : "rgba(255,255,255,.5)",
                  border: revealed
                    ? "1.5px solid rgba(255,180,200,.25)"
                    : "1.5px dashed rgba(0,0,0,.1)",
                  transition: "all .3s ease",
                  minHeight: 70,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  direction: "rtl",
                  boxShadow: revealed
                    ? "0 4px 16px rgba(0,0,0,.04)"
                    : "none",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: revealed
                      ? "rgba(255,255,255,.7)"
                      : "rgba(0,0,0,.03)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: revealed ? 22 : 18,
                    flexShrink: 0,
                    transition: "all .3s ease",
                  }}
                >
                  {revealed ? fact.emoji : "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {revealed ? (
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#333",
                        lineHeight: 1.7,
                      }}
                    >
                      {fact.text}
                    </p>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(0,0,0,.3)",
                      }}
                    >
                      بزن تا ببینی ✨
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(0,0,0,.3)",
            fontWeight: 600,
            marginTop: 18,
            direction: "rtl",
          }}
        >
          هر وقت چیز جدیدی یاد بگیرم اضافه میکنم 🐥
        </p>
      </div>
    </div>
  );
}
