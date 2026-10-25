import { useEffect, useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import Dialog from "./Dialog.jsx";

export default function ReceiptModal({ open, onClose, receipt }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);
  if (!receipt) return null;
  const lines = [
    "🍦 ICE CREAM HOTLINE RECEIPT 🍦",
    `For: ${receipt.profileName} ${receipt.profileAvatar}`,
    `Mood: ${receipt.mood}`,
    `Time: ${new Date(receipt.time).toLocaleString()}`,
    "",
    ...receipt.items.map((item) => `${item.emoji} ${item.name} × ${item.qty}`),
    `Container: ${receipt.container}`,
    receipt.toppingsText ? `Toppings: ${receipt.toppingsText}` : null,
    receipt.note ? `Note: ${receipt.note}` : null,
    "",
    `Total: $${receipt.total.toFixed(2)} (pretend)`,
    `Stamp earned! (${receipt.stampsNow} total)`,
    receipt.unlocked ? "🏆 UNLOCKED: Chocolate Chip Cookie!" : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
  async function copy() {
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  function share() {
    if (navigator.share)
      navigator
        .share({ title: "Ice Cream Order", text: lines })
        .catch(() => {});
    else copy();
  }
  return (
    <Dialog open={open} onClose={onClose} title="Order received">
      <div className="receipt-heading">
        <span className="eyebrow">ONE VERY GOOD DECISION</span>
        <h2>Order received. ♡</h2>
        <p>Pretend scoops. Very real happiness.</p>
      </div>
      <pre className="receipt-text">{lines}</pre>
      <div className="receipt-actions">
        <button className="primary-button" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied!" : "Copy receipt"}
        </button>
        <button className="secondary-button" onClick={share}>
          <Send size={15} /> Share
        </button>
      </div>
    </Dialog>
  );
}
