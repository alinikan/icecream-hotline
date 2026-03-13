import { useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

const DJ_URL = "/assets/dj.png";

export default function DJBooth({ audio, isTouch }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: isTouch ? 90 : 20,
        left: isTouch ? 16 : 20,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      {expanded && (
        <div className="glass-strong anim-pop" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, minWidth: 210 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,.5)", textTransform: "uppercase", letterSpacing: 1 }}>
            🎵 Vibe Control
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="btn btn-ghost" onClick={audio.toggle} style={{ padding: "8px 12px", minWidth: 0 }}>
              {audio.isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audio.volume}
              onChange={(e) => audio.changeVolume(parseFloat(e.target.value))}
              style={{ flex: 1, padding: 0, border: "none", background: "transparent", height: 6, accentColor: "var(--pink)" }}
            />
          </div>
          <div style={{ fontSize: 11, color: "rgba(0,0,0,.4)", textAlign: "center", fontWeight: 600 }}>
            {audio.isPlaying ? "The legend is performing live 🎤" : "The legend is taking a nap 😴"}
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: isTouch ? 56 : 68,
          height: isTouch ? 56 : 68,
          borderRadius: "50%",
          border: audio.isPlaying ? "3px solid var(--pink)" : "3px solid rgba(255,255,255,.8)",
          background: "#f5f0ea",
          backgroundImage: `url(${DJ_URL})`,
          backgroundSize: isTouch ? "44px" : "55px",
          backgroundPosition: "center 2px",
          backgroundRepeat: "no-repeat",
          boxShadow: audio.isPlaying ? "0 8px 28px rgba(255,107,138,.25)" : "0 8px 24px rgba(0,0,0,.12)",
          animation: audio.isPlaying ? "dj-vibe 0.8s ease-in-out infinite, music-pulse 1.5s ease infinite" : "none",
          transition: "transform .2s, border .3s, box-shadow .3s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Click for vibes 🎵"
      >
        {audio.isPlaying && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#4CAF50",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "grid",
              placeItems: "center",
              border: "2px solid #fff",
            }}
          >
            <Music size={9} color="#fff" />
          </div>
        )}
      </button>
    </div>
  );
}
