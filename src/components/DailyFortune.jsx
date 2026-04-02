import { useState, useMemo } from "react";

const FORTUNES = [
  { emoji: "🍦", text: "Today's flavour is main character energy — and you're serving it." },
  { emoji: "🔮", text: "A sweet surprise is heading your way. Stay ready." },
  { emoji: "🌙", text: "The stars say: extra scoops tonight. Who are we to argue?" },
  { emoji: "✨", text: "Someone's thinking about your smile right now. Just saying." },
  { emoji: "🧁", text: "Plot twist: you're even cooler than ice cream." },
  { emoji: "🍓", text: "Today's vibe: strawberry fields and zero stress." },
  { emoji: "🌈", text: "A rainbow doesn't know it's beautiful either. But here you are." },
  { emoji: "🍰", text: "Life is short. Get the waffle cone. Always." },
  { emoji: "💫", text: "Your energy today? Immaculate. Don't let anyone dim it." },
  { emoji: "🧸", text: "You deserve the kind of day that makes you forget your phone." },
  { emoji: "🌻", text: "Fun fact: sunflowers turn to face the sun. People turn to face you." },
  { emoji: "🍡", text: "Three scoops of confidence coming right up." },
  { emoji: "🫶", text: "The right people won't make you question your worth." },
  { emoji: "🐥", text: "Small reminder: you're somebody's favourite notification." },
  { emoji: "🎯", text: "You're closer to your goals than you think. Keep going." },
  { emoji: "🎀", text: "Whatever you're worried about — it's going to work out." },
  { emoji: "🌊", text: "Go with the flow today. The universe has a playlist for you." },
  { emoji: "🍪", text: "You're the chocolate chip in a world of plain cookies." },
  { emoji: "🎵", text: "Today's forecast: 100% chance of good vibes." },
  { emoji: "🌺", text: "Reminder: being yourself is not just enough — it's everything." },
  { emoji: "🍬", text: "Sweet things come to those who don't settle for vanilla." },
  { emoji: "🌙", text: "Late-night thoughts hit different. So do late-night scoops." },
  { emoji: "🫧", text: "Protect your peace like it's the last scoop of pistachio." },
  { emoji: "🍑", text: "Today's fortune: you'll make someone's day without even trying." },
  { emoji: "🧋", text: "Treat yourself. That's not advice, that's an order." },
  { emoji: "🪐", text: "You have your own orbit. People are just lucky to be in it." },
  { emoji: "🍯", text: "The best is yet to come :)" },
  { emoji: "🎈", text: "Let go of one thing today. Watch how light you feel." },
  { emoji: "🦊", text: "Be clever, be kind, be unbothered. In that order." },
  { emoji: "🌤️", text: "After every brain freeze comes the best part of the scoop." },
  { emoji: "💐", text: "You don't need a reason to smile today. But here's one: you're you." },
  { emoji: "🎶", text: "Your life has a soundtrack and today it slaps." },
  { emoji: "🎭", text: "Not every chapter is exciting. But yours is about to get good." },
  { emoji: "🧇", text: "Waffle cones > regular cones. You > regular people." },
  { emoji: "🌷", text: "Bloom at your own pace. Tulips don't rush either." },
  { emoji: "🍋", text: "When life gives you lemons, make lemon sorbet obviously." },
  { emoji: "🧁", text: "A cupcake never asks if it's enough. Be the cupcake." },
  { emoji: "🌟", text: "You're not lucky. You're just that good." },
  { emoji: "🎨", text: "Your life is a canvas. Today, use the bright colours." },
  { emoji: "🪄", text: "Something a little magical is about to happen." },
  { emoji: "🐻", text: "Bear hugs fix everything. Accept one today." },
  { emoji: "🎧", text: "Put on your favourite song. That's today's fortune. That's it." },
  { emoji: "🥄", text: "The best scoop is always the one you didn't overthink." },
  { emoji: "🎁", text: "Today is a gift. That's why they call it the present. (sorry lol)" },
  { emoji: "☁️", text: "Some days are soft. Let today be one of them." },
  { emoji: "🩷", text: "You don't have to be perfect to be worth it." },
  { emoji: "🪷", text: "Quiet moments aren't empty. They're full of you." },
  { emoji: "🌉", text: "The bridge you're scared to cross? It leads somewhere beautiful." },
  { emoji: "🫂", text: "You're allowed to rest without earning it first." },
  { emoji: "🎐", text: "Stillness isn't stuck. Sometimes it's the bravest thing." },
  { emoji: "🕯️", text: "You're the kind of warmth people didn't know they needed." },
  { emoji: "🌬️", text: "Exhale the version of you that's trying too hard." },
  { emoji: "🌅", text: "Every sunrise is proof that new beginnings are real." },
  { emoji: "🧣", text: "Wrap yourself in patience today. It looks good on you." },
  { emoji: "🪵", text: "Roots grow in the dark before anything blooms." },
  { emoji: "🍵", text: "Some people are storms. You're a warm cup of tea." },
  { emoji: "🌘", text: "Even the moon disappears sometimes. It always comes back full." },
  { emoji: "📖", text: "You're someone's proof that good people still exist." },
  { emoji: "🎐", text: "The things that are meant for you won't need forcing." },
  { emoji: "🌱", text: "Water the parts of yourself you keep neglecting." },
  { emoji: "🤍", text: "You carry more strength than you give yourself credit for." },
  { emoji: "🪞", text: "If you could see yourself the way others do, you'd never doubt again." },
  { emoji: "🌠", text: "Somewhere right now, something is aligning in your favour." },
  { emoji: "🫀", text: "Your heart knows things your head hasn't caught up to yet." },
  { emoji: "☀️", text: "You make ordinary moments feel like something worth remembering." },
  { emoji: "🧭", text: "You don't need all the answers. Just the next step." },
  { emoji: "📮", text: "A message you need to hear is on its way." },
  { emoji: "🌼", text: "You make people feel safe just by being around." },
  { emoji: "🎗️", text: "Your patience will be rewarded. Keep being you." },
  { emoji: "🛁", text: "Rest isn't lazy. It's brave. Take yours today." },
  { emoji: "🎀", text: "You don't owe anyone a perfect version of yourself." },
  { emoji: "🐚", text: "Beautiful things take time. You're proof." },
  { emoji: "🌛", text: "Sleep well tonight knowing you're doing better than you think." },
  { emoji: "🎠", text: "Not everything that goes in circles is wasted. Some things are rides." },
  { emoji: "🌸", text: "One day you'll look back at this moment and smile. Trust that." },
];

// Exact same logic as the original getDailyIndex
function getDailyIndex(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return dayOfYear % FORTUNES.length;
}

// Use noon to avoid DST midnight-boundary bugs
function noonOf(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
}

function getFortuneForDate(date) {
  return FORTUNES[getDailyIndex(noonOf(date))];
}

function formatDateLabel(date) {
  const today = noonOf(new Date());
  const target = noonOf(date);
  const diffDays = Math.round((today - target) / 86400000);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DailyFortune() {
  const [revealed, setRevealed] = useState(false);

  // Today's fortune — uses new Date() exactly like the original
  const todayFortune = useMemo(() => {
    const idx = getDailyIndex(new Date());
    return FORTUNES[idx];
  }, [new Date().toDateString()]);

  // 5 previous days, newest first
  const pastFortunes = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push({
        label: formatDateLabel(d),
        fortune: getFortuneForDate(d),
      });
    }
    return result;
  }, [new Date().toDateString()]);

  return (
    <div className="glass" style={{ padding: "16px 20px", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: "linear-gradient(135deg, #FFD700, #FFA500)",
          display: "grid", placeItems: "center", fontSize: 19, flexShrink: 0,
        }}>
          🔮
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(0,0,0,.75)" }}>
            Daily Fortune
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,.35)" }}>
            A new fortune every day, just for you
          </div>
        </div>
      </div>

      {/* ── Today's Fortune ── */}
      <div
        onClick={() => { if (!revealed) setRevealed(true); }}
        style={{
          position: "relative",
          background: revealed
            ? "linear-gradient(135deg, rgba(255,215,0,.12), rgba(255,165,0,.08))"
            : "linear-gradient(135deg, rgba(255,107,138,.08), rgba(255,171,145,.06))",
          borderRadius: 18,
          padding: "14px 16px",
          cursor: revealed ? "default" : "pointer",
          transition: "all .3s ease",
          border: revealed
            ? "1.5px solid rgba(255,215,0,.25)"
            : "1.5px solid rgba(255,107,138,.15)",
          overflow: "hidden",
        }}
      >
        {!revealed && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,.08) 45%, rgba(255,215,0,.15) 50%, rgba(255,215,0,.08) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "fortune-shimmer 3s ease-in-out infinite",
            borderRadius: 18, pointerEvents: "none",
          }} />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: revealed
              ? "linear-gradient(135deg, #FFD700, #FFA500)"
              : "linear-gradient(135deg, #FFAB91, #FF6B8A)",
            display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0,
            transition: "all .4s ease",
            animation: revealed ? "none" : "fortune-glow 3s ease-in-out infinite",
          }}>
            {revealed ? todayFortune.emoji : "✨"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2,
              color: revealed ? "var(--pink)" : "rgba(0,0,0,.4)",
              transition: "color .3s",
            }}>
              {revealed ? "Today's Fortune" : "Tap to reveal today's fortune"}
            </div>

            {revealed ? (
              <div className="anim-fade-up" style={{ marginTop: 3 }}>
                <p style={{
                  fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,.65)",
                  lineHeight: 1.5, fontStyle: "italic",
                }}>
                  "{todayFortune.text}"
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,.3)", marginTop: 2 }}>
                🍪 Your daily message is waiting...
              </p>
            )}
          </div>

          {!revealed && <div style={{ fontSize: 18, flexShrink: 0 }}>✨</div>}
        </div>
      </div>

      {/* ── Tomorrow – warm invite ── */}
      <div style={{
        marginTop: 10,
        background: "linear-gradient(135deg, rgba(168,230,207,.12), rgba(255,215,0,.06))",
        borderRadius: 16,
        padding: "12px 14px",
        border: "1.5px dashed rgba(168,230,207,.4)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(168,230,207,.4), rgba(255,215,0,.25))",
          display: "grid", placeItems: "center", fontSize: 14, flexShrink: 0,
        }}>
          🌅
        </div>
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
            color: "rgba(0,0,0,.35)",
          }}>
            Tomorrow
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,.4)", marginTop: 1 }}>
            Something sweet is waiting for you — see you tomorrow! 🌙
          </p>
        </div>
      </div>

      {/* ── Past 5 Days ── */}
      <div style={{ marginTop: 14 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
          color: "rgba(0,0,0,.3)", marginBottom: 8,
        }}>
          Recent Fortunes
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pastFortunes.map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,.5)",
                borderRadius: 14,
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,.04)",
                display: "flex", alignItems: "flex-start", gap: 10,
                opacity: 1 - i * 0.1,
              }}
            >
              <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>
                {item.fortune.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,.5)",
                  lineHeight: 1.45, fontStyle: "italic",
                }}>
                  "{item.fortune.text}"
                </p>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,.22)", marginTop: 4,
                }}>
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
