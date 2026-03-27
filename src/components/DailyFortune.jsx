import { useState, useMemo } from "react";

const FORTUNES = [
  { emoji: "🍦", text: "Today's flavour is main character energy — and you're serving it." },
  { emoji: "🔮", text: "A sweet surprise is heading your way. Stay ready." },
  { emoji: "🌙", text: "The stars say: extra scoops tonight. Who are we to argue?" },
  { emoji: "✨", text: "Someone's thinking about your smile right now. Just saying." },
  { emoji: "🍪", text: "You're the chocolate chip in a world of plain cookies." },
  { emoji: "🧁", text: "Plot twist: you're even cooler than ice cream." },
  { emoji: "🌸", text: "Soft things aren't weak. You're proof." },
  { emoji: "🍓", text: "Today's vibe: strawberry fields and zero stress." },
  { emoji: "🐥", text: "Small reminder: you're somebody's favourite notification." },
  { emoji: "🌈", text: "A rainbow doesn't know it's beautiful either. But here you are." },
  { emoji: "🍰", text: "Life is short. Get the waffle cone. Always." },
  { emoji: "💫", text: "Your energy today? Immaculate. Don't let anyone dim it." },
  { emoji: "🧸", text: "You deserve the kind of day that makes you forget your phone." },
  { emoji: "🌻", text: "Fun fact: sunflowers turn to face the sun. People turn to face you." },
  { emoji: "🎀", text: "Whatever you're worried about — it's going to work out." },
  { emoji: "🍡", text: "Three scoops of confidence coming right up." },
  { emoji: "🌊", text: "Go with the flow today. The universe has a playlist for you." },
  { emoji: "🦋", text: "Something you planted a while ago is about to bloom." },
  { emoji: "🍫", text: "Chocolate fixes most things. You fix the rest." },
  { emoji: "⭐", text: "You're not everyone's cup of tea. You're someone's double scoop." },
  { emoji: "🎵", text: "Today's forecast: 100% chance of good vibes." },
  { emoji: "🌺", text: "Reminder: being yourself is not just enough — it's everything." },
  { emoji: "🍬", text: "Sweet things come to those who don't settle for vanilla." },
  { emoji: "🐝", text: "You're busy, you're golden, and you make life sweeter." },
  { emoji: "🎪", text: "Life is a circus but you're the headliner, not the clown." },
  { emoji: "🧊", text: "Ice cold exterior? Nah. You're warm where it matters." },
  { emoji: "🌙", text: "Late-night thoughts hit different. So do late-night scoops." },
  { emoji: "🎯", text: "You're closer to your goals than you think. Keep going." },
  { emoji: "🫧", text: "Protect your peace like it's the last scoop of pistachio." },
  { emoji: "🍑", text: "Today's fortune: you'll make someone's day without even trying." },
  { emoji: "🎠", text: "Life's a carousel — enjoy the ride and pick the sparkly horse." },
  { emoji: "🌴", text: "Beach energy today. Even if you're on your couch." },
  { emoji: "🧋", text: "Treat yourself. That's not advice, that's an order." },
  { emoji: "🪐", text: "You have your own orbit. People are just lucky to be in it." },
  { emoji: "🍯", text: "Honey, the best is yet to come." },
  { emoji: "🎈", text: "Let go of one thing today. Watch how light you feel." },
  { emoji: "🦊", text: "Be clever, be kind, be unbothered. In that order." },
  { emoji: "🌤️", text: "After every brain freeze comes the best part of the scoop." },
  { emoji: "💐", text: "You don't need a reason to smile today. But here's one: you're you." },
  { emoji: "🎶", text: "Your life has a soundtrack and today it slaps." },
  { emoji: "🍨", text: "Sundaes are proof that the best things have layers." },
  { emoji: "🐈", text: "Channel your inner cat today: unbothered, moisturized, in your lane." },
  { emoji: "🎭", text: "Not every chapter is exciting. But yours is about to get good." },
  { emoji: "🫶", text: "The right people won't make you question your worth." },
  { emoji: "🧇", text: "Waffle cones > regular cones. You > regular people." },
  { emoji: "🌷", text: "Bloom at your own pace. Tulips don't rush either." },
  { emoji: "🍋", text: "When life gives you lemons, make lemon sorbet obviously." },
  { emoji: "🎤", text: "Main character energy: activated. Side characters: shook." },
  { emoji: "🦄", text: "Rare things don't need to explain themselves." },
  { emoji: "🧁", text: "A cupcake never asks if it's enough. Be the cupcake." },
  { emoji: "🌟", text: "You're not lucky. You're just that good." },
  { emoji: "🎨", text: "Your life is a canvas. Today, use the bright colours." },
  { emoji: "🍩", text: "The hole in the donut isn't missing — it's what makes it perfect." },
  { emoji: "🪄", text: "Something a little magical is about to happen." },
  { emoji: "🐻", text: "Bear hugs fix everything. Accept one today." },
  { emoji: "🎧", text: "Put on your favourite song. That's today's fortune. That's it." },
  { emoji: "🌮", text: "You can't make everyone happy. You're not ice cream. Wait—" },
  { emoji: "🥄", text: "The best scoop is always the one you didn't overthink." },
  { emoji: "💎", text: "Pressure makes diamonds. You've been shining for a while now." },
  { emoji: "🧃", text: "Stay juicy. Stay curious. Stay you." },
  { emoji: "🎁", text: "Today is a gift. That's why they call it the present. (sorry lol)" },
];

function getDailyIndex(fortuneCount) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return dayOfYear % fortuneCount;
}

export default function DailyFortune() {
  const [revealed, setRevealed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fortune = useMemo(() => {
    const idx = getDailyIndex(FORTUNES.length);
    return FORTUNES[idx];
  }, []);

  if (dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 22,
      left: 16,
      zIndex: 50,
    }}>
      {/* Revealed card */}
      {revealed && (
        <div
          className="anim-pop"
          style={{
            position: "absolute",
            bottom: 68,
            left: 0,
            width: "min(300px, 72vw)",
            background: "rgba(255, 255, 255, .92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255, 255, 255, .8)",
            borderRadius: 20,
            padding: "20px 18px 16px",
            boxShadow: "0 12px 40px rgba(0,0,0,.1)",
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            style={{
              position: "absolute", top: 8, right: 10,
              background: "none", border: "none", fontSize: 16,
              color: "rgba(0,0,0,.25)", fontWeight: 700, lineHeight: 1,
              padding: "2px 6px",
            }}
          >×</button>

          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--pink)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
            🔮 Today's Fortune
          </div>

          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {fortune.emoji}
          </div>

          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(0,0,0,.7)",
            lineHeight: 1.55,
            fontStyle: "italic",
          }}>
            "{fortune.text}"
          </p>

          <div style={{
            marginTop: 12,
            fontSize: 10,
            color: "rgba(0,0,0,.3)",
            fontWeight: 600,
          }}>
            New fortune every day ✨
          </div>
        </div>
      )}

      {/* Fortune cookie button */}
      <button
        onClick={() => setRevealed(v => !v)}
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: revealed
            ? "linear-gradient(135deg, #FFD700, #FFA500)"
            : "linear-gradient(135deg, #FFAB91, #FF6B8A)",
          color: "#fff",
          fontSize: 24,
          display: "grid",
          placeItems: "center",
          boxShadow: revealed
            ? "0 6px 20px rgba(255, 165, 0, .35)"
            : "0 6px 20px rgba(255, 107, 138, .3)",
          transition: "all .3s ease",
          animation: revealed ? "none" : "fortune-glow 3s ease-in-out infinite",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        🔮
      </button>
    </div>
  );
}
