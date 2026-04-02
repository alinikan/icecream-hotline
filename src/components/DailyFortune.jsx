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

function getDailyIndex(fortuneCount) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return dayOfYear % fortuneCount;
}

export default function DailyFortune() {
  const [revealed, setRevealed] = useState(false);

  const fortune = useMemo(() => {
    const idx = getDailyIndex(FORTUNES.length);
    return FORTUNES[idx];
  }, [new Date().toDateString()]);

  return (
    <div
      onClick={() => { if (!revealed) setRevealed(true); }}
      className="glass"
      style={{
        padding: "16px 20px",
        position: "relative",
        overflow: "hidden",
        cursor: revealed ? "default" : "pointer",
        transition: "all .3s ease",
      }}
    >
      {/* Shimmer effect when unrevealed */}
      {!revealed && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,215,0,.08) 45%, rgba(255,215,0,.15) 50%, rgba(255,215,0,.08) 55%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "fortune-shimmer 3s ease-in-out infinite",
          borderRadius: 24,
          pointerEvents: "none",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        {/* Crystal ball icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: revealed
            ? "linear-gradient(135deg, #FFD700, #FFA500)"
            : "linear-gradient(135deg, #FFAB91, #FF6B8A)",
          display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0,
          transition: "all .4s ease",
          animation: revealed ? "none" : "fortune-glow 3s ease-in-out infinite",
        }}>
          🔮
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2,
            color: revealed ? "var(--pink)" : "rgba(0,0,0,.4)",
            transition: "color .3s",
          }}>
            {revealed ? "Today's Fortune" : "Tap to reveal today's fortune"}
          </div>

          {revealed ? (
            <div className="anim-fade-up" style={{ marginTop: 4 }}>
              <p style={{
                fontSize: 14, fontWeight: 600, color: "rgba(0,0,0,.7)",
                lineHeight: 1.55, fontStyle: "italic",
              }}>
                {fortune.emoji} "{fortune.text}"
              </p>
              <p style={{ fontSize: 10, color: "rgba(0,0,0,.25)", fontWeight: 600, marginTop: 6 }}>
                New fortune every day ✨
              </p>
            </div>
          ) : (
            <p style={{
              fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,.3)", marginTop: 2,
            }}>
              🍪 Your daily message is waiting...
            </p>
          )}
        </div>

        {!revealed && (
          <div style={{ fontSize: 20 }}>
            ✨
          </div>
        )}
      </div>
    </div>
  );
}
