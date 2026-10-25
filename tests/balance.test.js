import assert from "node:assert/strict";
import { test } from "node:test";
import {
  advanceBalanceFall,
  evaluateBalanceDrop,
} from "../src/data/balance.js";

const aligned = {
  dropCenter: 200,
  supportCenter: 200,
  scoopWidth: 68,
  supportWidth: 68,
  baseCenter: 200,
  baseWidth: 85,
  stackCenters: [],
};

test("a centred scoop is supported by the actual rendered scoop width", () => {
  const result = evaluateBalanceDrop(aligned);
  assert.equal(result.landed, true);
  assert.equal(result.overlap, 68);
  assert.equal(result.points, 100);
});

test("a scoop with a visible gap cannot land or earn points", () => {
  const result = evaluateBalanceDrop({ ...aligned, dropCenter: 274 });
  assert.equal(result.landed, false);
  assert.equal(result.reason, "miss");
  assert.equal(result.overlap, 0);
  assert.equal(result.points, 0);
});

test("a thin edge touching the stack is not enough support", () => {
  const result = evaluateBalanceDrop({ ...aligned, dropCenter: 230 });
  assert.ok(result.overlap > 0);
  assert.equal(result.landed, false);
});

test("landing tolerance uses pixels rather than a forgiving screen percentage", () => {
  for (const arenaWidth of [300, 560, 900]) {
    const centre = arenaWidth / 2;
    assert.equal(
      evaluateBalanceDrop({
        ...aligned,
        dropCenter: centre + 30,
        supportCenter: centre,
        baseCenter: centre,
      }).landed,
      false,
    );
    assert.equal(
      evaluateBalanceDrop({
        ...aligned,
        dropCenter: centre + 10,
        supportCenter: centre,
        baseCenter: centre,
      }).landed,
      true,
    );
  }
});

test("the first scoop is checked against the cup's wider opening", () => {
  assert.equal(
    evaluateBalanceDrop({ ...aligned, supportWidth: 85, dropCenter: 230 })
      .landed,
    true,
  );
  assert.equal(
    evaluateBalanceDrop({ ...aligned, supportWidth: 85, dropCenter: 240 })
      .landed,
    false,
  );
});

test("a leaning tower topples even when adjacent scoops overlap", () => {
  const result = evaluateBalanceDrop({
    ...aligned,
    dropCenter: 260,
    supportCenter: 245,
    stackCenters: [215, 230, 245],
  });
  assert.ok(result.overlap > 42);
  assert.equal(result.landed, false);
  assert.equal(result.reason, "unstable");
});

test("a valid drop visibly falls before reaching its landing position", () => {
  const fall = {
    x: 50,
    elapsed: 0,
    duration: 0.42,
    fromBottom: 82,
    toBottom: 21,
    bottom: 82,
    result: evaluateBalanceDrop(aligned),
  };
  const moving = advanceBalanceFall(fall, 0.2);
  assert.equal(moving.finished, false);
  assert.ok(moving.bottom < 82 && moving.bottom > 21);
  const landed = advanceBalanceFall(moving, 0.3);
  assert.equal(landed.finished, true);
  assert.equal(landed.bottom, 21);
});

test("a missed scoop falls out of the arena instead of snapping onto the stack", () => {
  const result = evaluateBalanceDrop({ ...aligned, dropCenter: 280 });
  const missed = advanceBalanceFall(
    { elapsed: 0, duration: 0.58, fromBottom: 82, toBottom: -22, result },
    1,
  );
  assert.equal(missed.bottom, -22);
  assert.equal(missed.finished, true);
  assert.equal(missed.result.landed, false);
  assert.equal(missed.result.points, 0);
});
