import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addScoop,
  countScoops,
  expandScoops,
  isCaught,
  MAX_SCOOPS,
  safeProfile,
  shufflePairs,
} from "../src/data/studio.js";

test("the studio caps a creation at six scoops without mutating its cart", () => {
  const original = { straw: 5 };
  const full = addScoop(original, "vanilla");
  assert.deepEqual(original, { straw: 5 });
  assert.equal(countScoops(full), MAX_SCOOPS);
  assert.equal(addScoop(full, "choc"), full);
});

test("the 3D scoop list ignores missing flavours and bounds invalid quantities", () => {
  const flavours = [
    { id: "straw", name: "Strawberry" },
    { id: "vanilla", name: "Vanilla" },
  ];
  const result = expandScoops(
    { straw: 100, vanilla: -1, missing: 4 },
    flavours,
  );
  assert.equal(result.length, MAX_SCOOPS);
  assert.equal(new Set(result.map((item) => item.key)).size, MAX_SCOOPS);
  assert.ok(
    result.every((item) => item.id === "straw" && /^#/.test(item.colour)),
  );
});

test("a memory round contains six unique pairs with distinct card IDs", () => {
  const deck = shufflePairs(() => 0.4);
  assert.equal(deck.length, 12);
  assert.equal(new Set(deck.map((card) => card.id)).size, 12);
  for (let pair = 0; pair < 6; pair++) {
    const cards = deck.filter((card) => card.pair === pair);
    assert.equal(cards.length, 2);
    assert.equal(cards[0].symbol, cards[1].symbol);
  }
});

test("catching requires both horizontal alignment and reaching the cup", () => {
  assert.equal(isCaught({ x: 50, y: 84 }, 50), true);
  assert.equal(isCaught({ x: 60, y: 84 }, 50), false);
  assert.equal(isCaught({ x: 50, y: 10 }, 50), false);
  assert.equal(isCaught({ x: 50, y: 95 }, 50), false);
});

test("corrupt saved profiles fall back safely and invalid orders are excluded", () => {
  assert.equal(safeProfile(null).moodId, "cozy");
  const profile = safeProfile({
    moodId: "missing",
    favorites: ["straw", 3, null],
    stamps: -4,
    orderHistory: [{ total: "bad" }, null],
  });
  assert.equal(profile.moodId, "cozy");
  assert.deepEqual(profile.favorites, ["straw"]);
  assert.equal(profile.stamps, 0);
  assert.deepEqual(profile.orderHistory, []);
});

test("saved orders, original stamps, and world preferences survive normalisation", () => {
  const order = {
    time: 1234,
    total: 7.5,
    items: [{ name: "Vanilla", qty: 2 }],
  };
  const profile = safeProfile({
    moodId: "needahug",
    favorites: ["vanilla"],
    stamps: 4,
    avatar: "🌙",
    orderHistory: [order],
  });
  assert.equal(profile.moodId, "needahug");
  assert.equal(profile.stamps, 4);
  assert.deepEqual(profile.orderHistory, [order]);
});
