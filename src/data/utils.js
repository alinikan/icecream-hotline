export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function isTouchOnly() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(pointer: fine)").matches
  );
}
