import { useCallback, useEffect, useRef, useState } from "react";
import { createInteractionAudio } from "../data/interactionAudio.js";

export default function useSoundscape() {
  const engine = useRef(null);
  if (!engine.current) engine.current = createInteractionAudio();
  const [enabled, setEnabled] = useState(false);
  const toggle = useCallback(() => {
    setEnabled(engine.current.setEnabled(!engine.current.enabled));
  }, []);
  const chime = useCallback((kind) => engine.current.play(kind), []);
  useEffect(() => () => engine.current.dispose(), []);
  return { enabled, toggle, chime };
}
