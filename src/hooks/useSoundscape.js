import { useCallback, useEffect, useRef, useState } from "react";

export default function useSoundscape(world, reducedMotion) {
  const context = useRef(null);
  const active = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const ensureContext = useCallback(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!context.current || context.current.state === "closed")
      context.current = new AudioContext();
    context.current.resume().catch(() => {});
    return context.current;
  }, []);

  const chime = useCallback(
    (kind = "scoop", force = false) => {
      if (!active.current && !force) return;
      try {
        const ctx = ensureContext();
        if (!ctx) return;
        const base =
          kind === "win" ? 523.25 : kind === "topping" ? 659.25 : world.sound;
        const notes = kind === "win" ? [1, 1.25, 1.5, 2] : [1, 1.5];
        notes.forEach((ratio, index) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = ctx.currentTime + index * 0.09;
          oscillator.type = "sine";
          oscillator.frequency.value = base * ratio;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.045, start + 0.025);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
          oscillator.connect(gain).connect(ctx.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.75);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        });
      } catch {
        /* Audio is an optional enhancement. */
      }
    },
    [ensureContext, world.sound],
  );

  function toggle() {
    const next = !enabled;
    active.current = next;
    setEnabled(next);
    if (next) chime("scoop", true);
    else context.current?.suspend().catch(() => {});
  }

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(
      () => {
        if (document.visibilityState === "visible") chime("scoop");
      },
      reducedMotion ? 10000 : 6500,
    );
    return () => clearInterval(timer);
  }, [enabled, chime, reducedMotion]);
  useEffect(
    () => () => {
      context.current?.close().catch(() => {});
    },
    [],
  );
  return { enabled, toggle, chime };
}
