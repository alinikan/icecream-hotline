import { useEffect, useRef, useCallback } from "react";

const QS = [
  {
    q: "Does Mobina think Ali knows too much?",
    yes: "No! He should ask more questions 😌",
    no: "Obviously 😡",
    win: "✨ Then Ali will ask more questions ;)",
  },
  {
    q: "Is Mobina going to tell Ali more about herself?",
    yes: "Yes, obviously 🌸",
    no: "No way 🙅‍♀️",
    win: "😬 'Default Mobina' wouldn't be happy.",
  },
  {
    q: "Is Ali the nicest person to ever exist in the history of mankind?",
    yes: "Undeniably yes 🏆",
    no: "He's blocked 📵",
    win: "🏆 You made Ali smile :)",
  },
  {
    q: "Is Mobina going out with Ali for a protein shake?",
    yes: "Yes, let's go 💪",
    no: "Absolutely not 🚫",
    win: "💪 See you at Body Energy Club.",
  },
];

// How close (px) a finger needs to get before the No button runs
const TOUCH_FLEE_RADIUS = 90;

function RunawayCard({ q }) {
  const arenaRef  = useRef(null);
  const yesBtnRef = useRef(null);
  const noBtnRef  = useRef(null);
  const winRef    = useRef(null);

  const st = useRef({
    answered: false,
    curX: 0, curY: 0,
    tgtX: 0, tgtY: 0,
    raf: null,
    isMobile: false,
  });

  const tick = useCallback(() => {
    const r   = st.current;
    const btn = noBtnRef.current;
    if (!btn) return;
    r.curX += (r.tgtX - r.curX) * 0.13;
    r.curY += (r.tgtY - r.curY) * 0.13;
    btn.style.transform = `translate(${r.curX.toFixed(1)}px, ${r.curY.toFixed(1)}px)`;
    if (Math.abs(r.curX - r.tgtX) > 0.3 || Math.abs(r.curY - r.tgtY) > 0.3) {
      r.raf = requestAnimationFrame(tick);
    } else {
      r.raf = null;
    }
  }, []);

  const dodge = useCallback((clientX, clientY) => {
    const r      = st.current;
    const arena  = arenaRef.current;
    const yesBtn = yesBtnRef.current;
    const noBtn  = noBtnRef.current;
    if (r.answered || !arena || !yesBtn || !noBtn) return;

    const rect = arena.getBoundingClientRect();
    const aw   = arena.offsetWidth;
    const ah   = arena.offsetHeight;
    const nw   = noBtn.offsetWidth  || 130;
    const nh   = noBtn.offsetHeight || 44;
    const mx   = clientX - rect.left;
    const my   = clientY - rect.top;

    // No button can move freely across the full arena — not locked to right side
    const pad  = 6;
    const minX = pad;
    const maxX = aw - nw - pad;
    const minY = pad;
    const maxY = ah - nh - pad;
    if (maxX <= minX || maxY <= minY) return;

    let bx = r.tgtX, by = r.tgtY, best = -1;
    for (let i = 0; i < 40; i++) {
      const tx = minX + Math.random() * (maxX - minX);
      const ty = minY + Math.random() * (maxY - minY);
      const dm = Math.hypot(tx + nw / 2 - mx, ty + nh / 2 - my);
      const dc = Math.hypot(tx - r.curX, ty - r.curY);
      // Heavily prioritise distance from finger, secondarily avoid staying put
      const sc = dm * 3 + dc * 0.3;
      if (sc > best) { best = sc; bx = tx; by = ty; }
    }

    r.tgtX = Math.max(minX, Math.min(maxX, bx));
    r.tgtY = Math.max(minY, Math.min(maxY, by));
    if (!r.raf) r.raf = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const r      = st.current;
    const arena  = arenaRef.current;
    const yesBtn = yesBtnRef.current;
    const noBtn  = noBtnRef.current;
    const winMsg = winRef.current;
    if (!arena || !yesBtn || !noBtn || !winMsg) return;

    r.isMobile = window.matchMedia("(pointer: coarse)").matches;

    // Place No button at bottom-right of arena initially
    const place = () => {
      const aw = arena.offsetWidth;
      const ah = arena.offsetHeight;
      const nw = noBtn.offsetWidth  || 130;
      const nh = noBtn.offsetHeight || 44;
      r.curX = r.tgtX = Math.max(0, aw - nw - 6);
      r.curY = r.tgtY = Math.max(0, ah - nh - 6);
      noBtn.style.transform = `translate(${r.curX}px, ${r.curY}px)`;
    };

    const onYes = () => {
      if (r.answered) return;
      r.answered = true;
      if (r.raf) { cancelAnimationFrame(r.raf); r.raf = null; }
      yesBtn.style.background    = "linear-gradient(135deg,#66BB6A,#81C784)";
      yesBtn.style.boxShadow     = "0 4px 14px rgba(102,187,106,.3)";
      yesBtn.textContent         = "✓ " + q.yes;
      yesBtn.style.pointerEvents = "none";
      noBtn.style.display        = "none";
      winMsg.textContent         = q.win;
      winMsg.style.display       = "block";
    };

    // Desktop: dodge on mousemove over the No button
    const onMouseMove = (e) => dodge(e.clientX, e.clientY);

    // Mobile: track ALL touch movement on the document.
    // If finger gets within TOUCH_FLEE_RADIUS of the No button, it runs.
    const onTouchMove = (e) => {
      if (r.answered) return;
      const t     = e.touches[0];
      const nRect = noBtn.getBoundingClientRect();
      const cx    = nRect.left + nRect.width  / 2;
      const cy    = nRect.top  + nRect.height / 2;
      if (Math.hypot(t.clientX - cx, t.clientY - cy) < TOUCH_FLEE_RADIUS) {
        dodge(t.clientX, t.clientY);
      }
    };

    // Also dodge immediately on touchstart near the button
    const onTouchStart = (e) => {
      if (r.answered) return;
      const t     = e.touches[0];
      const nRect = noBtn.getBoundingClientRect();
      const cx    = nRect.left + nRect.width  / 2;
      const cy    = nRect.top  + nRect.height / 2;
      if (Math.hypot(t.clientX - cx, t.clientY - cy) < TOUCH_FLEE_RADIUS) {
        e.preventDefault();
        dodge(t.clientX, t.clientY);
      }
    };

    yesBtn.addEventListener("click", onYes);

    if (r.isMobile) {
      // Listen on document so we catch the finger before it lands on the button
      document.addEventListener("touchmove",  onTouchMove,  { passive: true });
      document.addEventListener("touchstart", onTouchStart, { passive: false });
    } else {
      noBtn.addEventListener("mousemove", onMouseMove);
    }

    const tid = setTimeout(place, 80);

    return () => {
      clearTimeout(tid);
      if (r.raf) cancelAnimationFrame(r.raf);
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove",  onTouchMove);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, [dodge, q]);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1.5px solid #FFCCD8",
      padding: "16px 18px 14px",
      marginBottom: 10,
      boxShadow: "0 2px 12px rgba(255,107,138,0.08)",
    }}>
      {/* Question text */}
      <p style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#222",
        lineHeight: 1.55,
        marginBottom: 12,
      }}>
        {q.q}
      </p>

      {/*
        Arena: tall enough for both buttons to have real room to dodge.
        Yes sits top-left. No starts bottom-right and roams freely.
      */}
      <div
        ref={arenaRef}
        style={{
          position: "relative",
          width: "100%",
          height: 104, // room for two 44px buttons with padding
        }}
      >
        {/* YES — anchored top-left, never moves */}
        <button
          ref={yesBtnRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: 44,
            padding: "0 20px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #FF6B8A, #FF8FA3)",
            color: "#fff",
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
            zIndex: 2,
            boxShadow: "0 4px 14px rgba(255,107,138,.25)",
            WebkitTapHighlightColor: "transparent",
            transition: "background 0.25s, box-shadow 0.25s",
          }}
        >
          {q.yes}
        </button>

        {/* NO — starts bottom-right, glides away from finger */}
        <button
          ref={noBtnRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 44,
            padding: "0 18px",
            borderRadius: 14,
            border: "1.5px solid #DDD",
            background: "#F2F2F2",
            color: "#444",
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            zIndex: 3,
            WebkitTapHighlightColor: "transparent",
            // Use transform for buttery-smooth GPU animation
            willChange: "transform",
          }}
        >
          {q.no}
        </button>
      </div>

      {/* Win message */}
      <div
        ref={winRef}
        style={{
          display: "none",
          marginTop: 8,
          fontSize: 12,
          fontWeight: 700,
          color: "#2E7D32",
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

export default function RunawayQuestions() {
  return (
    <div
      className="glass"
      style={{
        padding: "16px 20px",
        background: "rgba(255, 220, 230, 0.65)",
        border: "1px solid rgba(255, 160, 185, 0.4)",
        overflow: "hidden",
      }}
    >
      {/* Header — same pattern as DailyFortune */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: "linear-gradient(135deg, #FF6B8A, #FFAB91)",
          display: "grid", placeItems: "center", fontSize: 19, flexShrink: 0,
        }}>
          🕵️
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(0,0,0,.75)" }}>
            Just a few questions
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,.35)" }}>
            The "No" button is totally clickable.
          </div>
        </div>
      </div>

      {QS.map((q, i) => (
        <RunawayCard key={i} q={q} />
      ))}
    </div>
  );
}
