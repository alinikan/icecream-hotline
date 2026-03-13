import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function NameErrorToast({ show, onHide }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onHide, 3500);
      return () => clearTimeout(t);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div
      style={{
        animation: "pop-in 0.3s ease both",
        marginTop: 8,
        padding: "10px 14px",
        borderRadius: 14,
        background: "#FFF0F0",
        border: "1.5px solid #FFB8B8",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#D32F2F",
      }}
    >
      <AlertCircle size={16} style={{ flexShrink: 0 }} />
      <span>
        Nice try! This website is exclusively for <b>Mobina</b>. No name changes allowed 😤
      </span>
    </div>
  );
}
