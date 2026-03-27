import { useState, useMemo, useEffect } from "react";
import { Star, Gift, ShoppingBag, Clock } from "lucide-react";

import { FLAVOURS, TOPPINGS, MOODS, AVATARS, STAMPS_TO_UNLOCK } from "./data/flavours.js";
import { clamp, isTouchOnly } from "./data/utils.js";
import trackVisitor from "./data/trackVisitor.js";
import useAudio from "./hooks/useAudio.js";

import FloatingEmojis from "./components/FloatingEmojis.jsx";
import Confetti from "./components/Confetti.jsx";
import DJBooth from "./components/DJBooth.jsx";
import StampCard from "./components/StampCard.jsx";
import NameErrorToast from "./components/NameErrorToast.jsx";
import FlavourCard from "./components/FlavourCard.jsx";
import OrderPanel from "./components/OrderPanel.jsx";
import ReceiptModal from "./components/ReceiptModal.jsx";
import OrderHistoryPanel from "./components/OrderHistoryPanel.jsx";
import DeliveryHotline from "./components/DeliveryHotline.jsx";
import AboutMobina from "./components/AboutMobina.jsx";
import DailyFortune from "./components/DailyFortune.jsx";

export default function App() {
  const audio = useAudio();
  const [screen, setScreen] = useState("login");
  const [avatar, setAvatar] = useState("🍦");
  const [moodId, setMoodId] = useState("cozy");
  const [favorites, setFavorites] = useState([]);
  const [stamps, setStamps] = useState(0);
  const [cart, setCart] = useState({}); // { flavourId: qty }
  const [container, setContainer] = useState("cup");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [showFavs, setShowFavs] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [nameShake, setNameShake] = useState(false);
  const [spriteJump, setSpriteJump] = useState(false);
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const isTouch = useMemo(() => isTouchOnly(), []);
  const name = "Mobina"; // Locked!

  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => { trackVisitor(); }, []);

  // Derived state
  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const f = FLAVOURS.find((x) => x.id === id);
          return f ? { ...f, qty } : null;
        })
        .filter(Boolean),
    [cart]
  );

  const mood = useMemo(() => MOODS.find((m) => m.id === moodId) || MOODS[0], [moodId]);
  const unlockedLegendary = stamps >= STAMPS_TO_UNLOCK;

  const allTags = useMemo(() => {
    const s = new Set();
    FLAVOURS.forEach((f) => {
      if (!f.legendary) f.tags.forEach((t) => s.add(t));
    });
    return ["all", ...Array.from(s).sort()];
  }, []);

  const visibleFlavours = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FLAVOURS.filter((f) => {
      if (f.legendary && !unlockedLegendary) return false;
      if (showFavs && !favorites.includes(f.id)) return false;
      if (tagFilter !== "all" && !f.tags.includes(tagFilter)) return false;
      if (!q) return true;
      return `${f.name} ${f.tags.join(" ")}`.toLowerCase().includes(q);
    });
  }, [search, showFavs, tagFilter, favorites, unlockedLegendary]);

  const total = useMemo(() => {
    if (!cartItems.length) return 0;
    const fc = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tc = selectedToppings.reduce((s, id) => {
      const t = TOPPINGS.find((x) => x.id === id);
      return s + (t ? t.price : 0);
    }, 0);
    const cf = container === "waffle" ? 1.25 : container === "cone" ? 0.75 : 0;
    const mm = moodId === "hungry" ? 1.06 : moodId === "celebration" ? 1.04 : 1.0;
    return (fc + tc + cf) * mm;
  }, [cartItems, selectedToppings, container, moodId]);

  const isDesktop = w >= 768;

  // Actions
  function handleNameFocus() {
    setNameError(true);
    setNameShake(true);
    setTimeout(() => setNameShake(false), 500);
  }

  function toggleFav(id) {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }

  function addToCart(f) {
    setCart((c) => ({ ...c, [f.id]: (c[f.id] || 0) + 1 }));
  }

  function updateCartQty(id, delta) {
    setCart((c) => {
      const nq = (c[id] || 0) + delta;
      if (nq <= 0) {
        const { [id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: clamp(nq, 1, 12) };
    });
  }

  function removeFromCart(id) {
    setCart((c) => {
      const { [id]: _, ...rest } = c;
      return rest;
    });
  }

  function toggleTopping(id) {
    setSelectedToppings((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  }

  function surprise() {
    const av = FLAVOURS.filter((f) => !f.legendary || unlockedLegendary);
    const nc = {};
    for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
      const f = av[Math.floor(Math.random() * av.length)];
      nc[f.id] = (nc[f.id] || 0) + 1 + Math.floor(Math.random() * 2);
    }
    setCart(nc);
    setSelectedToppings(TOPPINGS.filter(() => Math.random() > 0.6).map((t) => t.id));
    setContainer(["cup", "cone", "waffle"][Math.floor(Math.random() * 3)]);
  }

  function placeOrder() {
    if (!cartItems.length) return;
    const ns = stamps + 1;
    const ju = ns >= STAMPS_TO_UNLOCK && stamps < STAMPS_TO_UNLOCK;
    const items = cartItems.map((i) => ({ name: i.name, emoji: i.emoji, qty: i.qty }));
    const tt = selectedToppings
      .map((id) => { const t = TOPPINGS.find((x) => x.id === id); return t ? `${t.emoji} ${t.name}` : id; })
      .join(", ");

    const nr = {
      time: Date.now(), profileName: name, profileAvatar: avatar,
      mood: `${mood.emoji} ${mood.name}`, items, container, toppingsText: tt,
      note, total, stampsNow: ns, unlocked: ju,
    };

    setReceipt(nr);
    setReceiptOpen(true);
    setStamps(ns);
    setOrderHistory((h) => [...h, nr]);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);

    setCart({});
    setSelectedToppings([]);
    setNote("");
    setContainer("cup");
  }

  return (
    <>
      <FloatingEmojis />
      <Confetti active={confetti} />
      {screen === "shop" && <DJBooth audio={audio} isTouch={isTouch} />}

      {screen === "shop" && <DailyFortune />}

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 14px" }}>

          {/* ─── HEADER ─── */}
          <header className="anim-fade-up" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="anim-float" style={{
                width: 44, height: 44, borderRadius: 16,
                background: `linear-gradient(135deg, ${mood.accent}, #fff)`,
                display: "grid", placeItems: "center", fontSize: 22,
                boxShadow: "0 6px 20px rgba(0,0,0,.06)",
              }}>🍦</div>
              <div>
                <h1 style={{
                  fontSize: isDesktop ? 22 : 18, fontWeight: 800, fontFamily: "'Playfair Display', serif",
                  background: "linear-gradient(135deg,#FF6B8A,#FFAB91)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Ice Cream Hotline</h1>
                <p style={{ fontSize: 11, color: "rgba(0,0,0,.45)", fontWeight: 600 }}>
                  Mobina's private ice cream portal. VIP access only.
                </p>
              </div>
            </div>
            {screen === "shop" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <div className="glass" style={{ padding: "6px 12px", fontSize: 13, fontWeight: 700, borderRadius: 14 }}>
                  {avatar} {name}
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}
                  onClick={() => { if (orderHistory.length) { setReceipt(orderHistory[orderHistory.length - 1]); setReceiptOpen(true); }}}
                  disabled={!orderHistory.length}>
                  <Clock size={13} /> Last
                </button>
              </div>
            )}
          </header>

          {/* ─── LOGIN SCREEN ─── */}
          {screen === "login" && (
            <div className="anim-fade-up" style={{ marginTop: 28, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              <div className="glass-strong" style={{ padding: isDesktop ? "32px 28px" : "24px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🍦🍪</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isDesktop ? 28 : 24, fontWeight: 700 }}>
                  Hey Mobina!
                </h2>
                <p style={{ fontSize: 14, color: "rgba(0,0,0,.5)", marginTop: 6, lineHeight: 1.6 }}>
                  Welcome to your private ice cream portal.<br />
                  Pick any flavour. Any mood. Unlimited scoops.
                </p>

                <div style={{ marginTop: 20, textAlign: "left" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Your Name
                  </label>
                  <div className={nameShake ? "anim-shake" : ""}>
                    <input value={name} readOnly onFocus={handleNameFocus} onClick={handleNameFocus} style={{ marginTop: 6 }} />
                  </div>
                  <NameErrorToast show={nameError} onHide={() => setNameError(false)} />
                </div>

                <div style={{ marginTop: 14, textAlign: "left" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Pick Your Avatar
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {AVATARS.map((a) => (
                      <button key={a} onClick={() => setAvatar(a)} style={{
                        width: 46, height: 46, borderRadius: 14, fontSize: 20, display: "grid", placeItems: "center",
                        border: avatar === a ? "2px solid var(--pink)" : "1.5px solid rgba(0,0,0,.08)",
                        background: avatar === a ? "#FFE4EC" : "rgba(255,255,255,.6)", transition: "all .2s",
                        WebkitTapHighlightColor: "transparent",
                      }}>{a}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 14, textAlign: "left" }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                    How Are You Feeling?
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {MOODS.map((m) => (
                      <button key={m.id} className="btn" onClick={() => setMoodId(m.id)} style={{
                        fontSize: 13, padding: "8px 14px",
                        background: moodId === m.id ? "var(--pink)" : "rgba(255,255,255,.6)",
                        color: moodId === m.id ? "#fff" : "#555",
                        border: moodId === m.id ? "1.5px solid var(--pink)" : "1.5px solid rgba(0,0,0,.06)",
                      }}>{m.emoji} {m.name}</button>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: "flex", alignItems: "flex-end", gap: 12,
                  marginTop: 24, justifyContent: "center",
                }}>
                  <img
                    src="/assets/mobina-sprite.png"
                    alt="Mobina"
                    style={{
                      width: 52,
                      height: "auto",
                      imageRendering: "pixelated",
                      animation: spriteJump
                        ? "sprite-jump 0.5s ease both"
                        : "idle-bounce 2s ease-in-out infinite",
                      flexShrink: 0,
                    }}
                  />
                  <button className="btn btn-primary" onClick={() => {
                    setSpriteJump(true);
                    setTimeout(() => { setScreen("shop"); audio.play(); setSpriteJump(false); }, 600);
                  }}
                    style={{ flex: 1, padding: 14, fontSize: 16 }}>
                    Let Me In! 🍦
                  </button>
                </div>
                {!isTouch && (
                  <p style={{ fontSize: 11, color: "rgba(0,0,0,.35)", marginTop: 10 }}>
                    (psst — check your cursor, a legend is following you 😎)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── SHOP SCREEN ─── */}
          {screen === "shop" && (
            <>
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr", gap: 16, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* About Mobina */}
                  <AboutMobina isOpen={aboutOpen} onToggle={() => setAboutOpen(v => !v)} />

                  {/* Search & filters */}
                  <div className="glass" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div>
                        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Menu</h2>
                        <p style={{ fontSize: 13, color: "rgba(0,0,0,.5)" }}>
                          Welcome back, <b>{name}</b>! Your scoops await 🍦
                        </p>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                        <div className="glass" style={{ padding: "5px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          Mood:
                          <select value={moodId} onChange={(e) => setMoodId(e.target.value)} style={{ background: "none", border: "none", fontWeight: 800, fontSize: 12, marginLeft: 4, padding: 0, width: "auto" }}>
                            {MOODS.map((m) => <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>)}
                          </select>
                        </div>
                        <button className="btn btn-ghost" onClick={() => setShowFavs((v) => !v)} style={{ fontSize: 12, padding: "5px 10px" }}>
                          {showFavs ? <><Star size={13} fill="#FFD700" color="#FFD700" /> Faves</> : <><Star size={13} /> Faves</>}
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 10 }}>
                      <input placeholder="Search flavours..." value={search} onChange={(e) => setSearch(e.target.value)} />
                      <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} style={{ minWidth: 90 }}>
                        {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Flavour grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: 12 }}>
                    {visibleFlavours.map((f, i) => (
                      <div key={f.id} style={{ animationDelay: `${i * 0.03}s` }} className="anim-fade-up">
                        <FlavourCard f={f} isFav={favorites.includes(f.id)} isLocked={f.legendary && !unlockedLegendary} onFav={toggleFav} onAdd={addToCart} />
                      </div>
                    ))}
                    {!visibleFlavours.length && (
                      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "rgba(0,0,0,.4)" }}>
                        <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>No flavours found!
                      </div>
                    )}
                  </div>

                  <StampCard stamps={stamps} />
                  <DeliveryHotline />
                  <OrderHistoryPanel history={orderHistory} onView={(r) => { setReceipt(r); setReceiptOpen(true); }} />

                  {/* How it works */}
                  <div className="glass" style={{ padding: "18px 22px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      <Gift size={16} style={{ color: "var(--pink)" }} /> How It Works
                    </h3>
                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 10 }}>
                      {[
                        ["1️⃣", "Pick your mood & flavours"],
                        ["2️⃣", "Build your dream order"],
                        ["3️⃣", "Get a cute receipt"],
                        ["4️⃣", `${STAMPS_TO_UNLOCK} stamps = secret flavour!`],
                      ].map(([n, t]) => (
                        <div key={n} style={{
                          background: "rgba(255,255,255,.5)", borderRadius: 14, padding: "10px 12px",
                          border: "1px solid rgba(0,0,0,.04)", fontSize: 12, fontWeight: 600,
                          color: "rgba(0,0,0,.6)", display: "flex", gap: 6,
                        }}>
                          <span style={{ fontSize: 16 }}>{n}</span>{t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cart button (always visible) */}
              <button onClick={() => setMobileOrderOpen(true)} style={{
                position: "fixed", bottom: 20, right: 16, zIndex: 50,
                width: isDesktop ? 64 : 56, height: isDesktop ? 64 : 56, borderRadius: "50%",
                background: "linear-gradient(135deg,#FF6B8A,#FF8FA3)", color: "#fff", border: "none",
                display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(255,107,138,.35)",
                WebkitTapHighlightColor: "transparent",
              }}>
                <ShoppingBag size={isDesktop ? 24 : 22} />
                {cartItems.length > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4, background: "#1a1a2e", color: "#fff",
                    fontSize: 11, fontWeight: 800, width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center",
                  }}>{cartItems.reduce((s, i) => s + i.qty, 0)}</span>
                )}
              </button>

              {/* Order panel bottom sheet */}
              {mobileOrderOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", alignItems: isDesktop ? "center" : "stretch" }}>
                  <div
                    style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
                    onClick={() => setMobileOrderOpen(false)}
                  />
                  <div style={{
                    position: "relative", marginTop: "auto", maxHeight: "88vh", overflowY: "auto",
                    width: isDesktop ? "min(480px, 100%)" : "100%",
                    borderRadius: "24px 24px 0 0", background: "var(--cream)", padding: "8px 0 0",
                    WebkitOverflowScrolling: "touch",
                  }}>
                    <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,.15)", margin: "0 auto 8px" }} />
                    <div style={{ padding: "0 12px 24px" }}>
                      <OrderPanel
                        mood={mood} cartItems={cartItems} toppings={TOPPINGS}
                        selectedToppings={selectedToppings} container={container} note={note}
                        onUpdateQty={updateCartQty} onRemove={removeFromCart}
                        onContainer={setContainer} onToggleTopping={toggleTopping}
                        onNote={setNote}
                        onPlace={() => { placeOrder(); setMobileOrderOpen(false); }}
                        onSurprise={surprise} total={total}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <footer style={{ marginTop: 40, paddingBottom: 100, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,.3)", fontWeight: 600 }}>Made with 🍦 just for Mobina</p>
          </footer>
        </div>
      </div>

      <ReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} receipt={receipt} />
    </>
  );
}