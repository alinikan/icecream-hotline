import { useEffect, useRef, useCallback } from "react";

const QS = [
  {
    q: "Is Mobina going to tell Ali more about herself?",
    yes: "Yes, obviously 🌸",
    no: "No way 🙅‍♀️",
    win: "😬 Default Mobina wouldn't be proud.",
  },
  {
    q: "Is Mobina going out with Ali for a protein shake?",
    yes: "Yes, let's go 💪",
    no: "Absolutely not 🚫",
    win: "💪 Body Energy Club it is.",
  },
  {
    q: "Does Mobina think this is the best website ever?",
    yes: "Obviously yes ✨",
    no: "Hmm, maybe not 🤔",
    win: "✨ Correct answer.",
  },
  {
    q: "Is Ali the nicest person to ever exist in the history of mankind?",
    yes: "Undeniably yes 🏆",
    no: "He's blocked 📵",
    win: "🏆 You made Ali happy. Congrats.",
  },
];

function RunawayCard({ q }) {
  const rowRef    = useRef(null);
  const yesBtnRef = useRef(null);
  const noBtnRef  = useRef(null);
  const winRef    = useRef(null);

  const st = useRef({
    answered: false,
    curX: 0, curY: 0,
    tgtX: 0, tgtY: 0,
    raf: null,
  });

  const tick = useCallback(() => {
    const r   = st.current;
    const btn = noBtnRef.current;
    if (!btn) return;
    r.curX += (r.tgtX - r.curX) * 0.14;
    r.curY += (r.tgtY - r.curY) * 0.14;
    btn.style.left = r.curX.toFixed(1) + "px";
    btn.style.top  = r.curY.toFixed(1) + "px";
    if (Math.abs(r.curX - r.tgtX) > 0.2 || Math.abs(r.curY - r.tgtY) > 0.2) {
      r.raf = requestAnimationFrame(tick);
    } else {
      r.raf = null;
    }
  }, []);

  const dodge = useCallback((clientX, clientY) => {
    const r      = st.current;
    const row    = rowRef.current;
    const yesBtn = yesBtnRef.current;
    const noBtn  = noBtnRef.current;
    if (r.answered || !row || !yesBtn || !noBtn) return;

    const rect = row.getBoundingClientRect();
    const rw   = row.offsetWidth;
    const rh   = row.offsetHeight;
    const nw   = noBtn.offsetWidth  || 140;
    const nh   = noBtn.offsetHeight || 44;
    const mx   = clientX - rect.left;
    const my   = clientY - rect.top;
    const yw   = yesBtn.offsetWidth;

    const minX = yw + 10;
    const maxX = rw - nw;
    const minY = 0;
    const maxY = Math.max(0, rh - nh);
    if (maxX <= minX) return;

    let bx = r.tgtX, by = r.tgtY, best = -1;
    for (let i = 0; i < 30; i++) {
      const tx = minX + Math.random() * (maxX - minX);
      const ty = minY + Math.random() * Math.max(1, maxY - minY);
      const dm = Math.hypot(tx + nw / 2 - mx, ty + nh / 2 - my);
      const dc = Math.hypot(tx - r.curX, ty - r.curY);
      const sc = dm * 2 + dc * 0.4;
      if (sc > best) { best = sc; bx = tx; by = ty; }
    }

    r.tgtX = Math.max(minX, Math.min(maxX, bx));
    r.tgtY = Math.max(minY, Math.min(maxY, by));
    if (!r.raf) r.raf = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    const r      = st.current;
    const row    = rowRef.current;
    const yesBtn = yesBtnRef.current;
    const noBtn  = noBtnRef.current;
    const winMsg = winRef.current;
    if (!row || !yesBtn || !noBtn || !winMsg) return;

    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    const place = () => {
      const rw = row.offsetWidth;
      const nw = noBtn.offsetWidth || 140;
      r.curX = r.tgtX = Math.max(0, rw - nw);
      r.curY = r.tgtY = 0;
      noBtn.style.left = r.curX + "px";
      noBtn.style.top  = r.curY + "px";
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

    const onMouseMove  = (e) => dodge(e.clientX, e.clientY);
    const onTouchStart = (e) => {
      e.preventDefault();
      dodge(e.touches[0].clientX, e.touches[0].clientY);
    };

    yesBtn.addEventListener("click", onYes);
    if (isMobile) {
      noBtn.addEventListener("touchstart", onTouchStart, { passive: false });
    } else {
      noBtn.addEventListener("mousemove", onMouseMove);
    }

    const tid = setTimeout(place, 60);

    return () => {
      clearTimeout(tid);
      if (r.raf) cancelAnimationFrame(r.raf);
      yesBtn.removeEventListener("click", onYes);
      noBtn.removeEventListener("mousemove", onMouseMove);
      noBtn.removeEventListener("touchstart", onTouchStart);
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
      <p style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#222",
        lineHeight: 1.55,
        marginBottom: 14,
      }}>
        {q.q}
      </p>

      <div ref={rowRef} style={{ position: "relative", height: 46 }}>
        {/* YES — fixed left, never moves */}
        <button
          ref={yesBtnRef}
          style={{
            position: "absolute",
            left: 0,
            top: 1,
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

        {/* NO — starts right, glides away on hover/touch */}
        <button
          ref={noBtnRef}
          style={{
            position: "absolute",
            top: 1,
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
          }}
        >
          {q.no}
        </button>
      </div>

      <div
        ref={winRef}
        style={{
          display: "none",
          marginTop: 10,
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
