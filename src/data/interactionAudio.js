// Sounds are event-driven. Enabling them never schedules an idle loop.
export function createInteractionAudio(
  createContext = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return AudioContext ? new AudioContext() : null;
  },
) {
  let context = null;
  let enabled = false;
  const voices = new Set();

  function stopVoices() {
    for (const voice of voices) {
      try {
        voice.oscillator.stop();
      } catch {
        /* The note may already have ended. */
      }
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    }
    voices.clear();
  }

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(next) {
      enabled = Boolean(next);
      if (!enabled) {
        stopVoices();
        context?.suspend()?.catch(() => {});
      }
      // No oscillator, timer, or playback is started here.
      return enabled;
    },
    play(kind = "scoop") {
      if (!enabled) return;
      try {
        if (!context || context.state === "closed") context = createContext();
        if (!context) return;
        context.resume()?.catch(() => {});
        const frequency =
          kind === "win" ? 1046.5 : kind === "topping" ? 987.77 : 783.99;
        const notes = kind === "win" ? [1, 1.25, 1.5] : [1];
        notes.forEach((ratio, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + index * 0.07;
          oscillator.type = "sine";
          oscillator.frequency.value = frequency * ratio;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.018, start + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
          oscillator.connect(gain).connect(context.destination);
          const voice = { oscillator, gain };
          voices.add(voice);
          oscillator.onended = () => {
            voices.delete(voice);
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(start);
          oscillator.stop(start + 0.2);
        });
      } catch {
        /* Effects are optional and must not interrupt the page. */
      }
    },
    dispose() {
      enabled = false;
      stopVoices();
      context?.close()?.catch(() => {});
      context = null;
    },
  };
}
