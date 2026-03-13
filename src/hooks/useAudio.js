import { useState, useRef, useCallback } from "react";

const SONG_URL = "/assets/song.mp3";

export default function useAudio() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const initDone = useRef(false);

  const initAudio = useCallback(() => {
    if (initDone.current && audioRef.current) return audioRef.current;
    try {
      const a = new Audio(SONG_URL);
      a.loop = true;
      a.volume = volume;
      a.preload = "auto";
      a.addEventListener("pause", () => setIsPlaying(false));
      a.addEventListener("play", () => setIsPlaying(true));
      audioRef.current = a;
      initDone.current = true;
      return a;
    } catch (e) {
      console.error("Audio init failed:", e);
      return null;
    }
  }, []);

  const play = useCallback(() => {
    const a = initAudio();
    if (!a) return;
    a.volume = volume;
    a.play().catch((e) => console.log("Play blocked:", e));
  }, [initAudio, volume]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const changeVolume = useCallback((v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return { isPlaying, volume, play, pause, toggle, changeVolume };
}
