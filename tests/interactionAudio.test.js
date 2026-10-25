import assert from "node:assert/strict";
import { test } from "node:test";
import { createInteractionAudio } from "../src/data/interactionAudio.js";

function fixture() {
  const notes = [];
  let contexts = 0;
  const context = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: async () => {},
    suspend: async () => {},
    close: async () => {},
    createGain: () => ({
      gain: {
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
      disconnect() {},
    }),
    createOscillator: () => {
      const note = {
        frequency: { value: 0 },
        connect: (target) => target,
        disconnect() {},
        start(time) {
          this.started = time;
        },
        stop(time) {
          this.stopped = time;
        },
      };
      notes.push(note);
      return note;
    },
  };
  const audio = createInteractionAudio(() => {
    contexts++;
    return context;
  });
  return { audio, notes, context, contexts: () => contexts };
}

test("enabling effects stays silent, including a full minute of idle time", (t) => {
  t.mock.timers.enable({ apis: ["setInterval", "setTimeout"] });
  const setup = fixture();
  setup.audio.setEnabled(true);
  t.mock.timers.tick(60_000);
  assert.equal(setup.contexts(), 0);
  assert.equal(setup.notes.length, 0);
});

test("one explicit action produces one short note without an idle replay", (t) => {
  t.mock.timers.enable({ apis: ["setInterval", "setTimeout"] });
  const { audio, notes } = fixture();
  audio.setEnabled(true);
  audio.play("scoop");
  assert.equal(notes.length, 1);
  assert.ok(notes[0].frequency.value > 700);
  assert.equal(notes[0].stopped - notes[0].started, 0.2);
  t.mock.timers.tick(60_000);
  assert.equal(notes.length, 1);
});

test("muted effects never create audio, and muting stops an active note", () => {
  const { audio, notes, contexts } = fixture();
  audio.play("scoop");
  assert.equal(contexts(), 0);
  audio.setEnabled(true);
  audio.play("topping");
  assert.equal(notes.length, 1);
  audio.setEnabled(false);
  assert.equal(notes[0].stopped, undefined);
  audio.play("win");
  assert.equal(notes.length, 1);
});
