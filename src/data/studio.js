export const MAX_SCOOPS = 6;

export const FLAVOUR_COLOURS = {
  vanilla: "#f5dfb6",
  choc: "#704338",
  straw: "#ef9cab",
  mint: "#9cc5ac",
  cookies: "#e8d7bc",
  caramel: "#d79c58",
  matcha: "#a9b675",
  mango: "#f7b94e",
  coffee: "#b68b70",
  cake: "#e9bcd0",
  pistachio: "#bcc68e",
  rocky: "#80584c",
  bubblegum: "#d9a6d8",
  lemon: "#f4d77d",
  blueberry: "#aca7ce",
  peanut: "#c78b54",
  cotton: "#e8b6d1",
  redvelvet: "#b96366",
  coconut: "#f0ebda",
  brownbutter: "#c19869",
  rosewater: "#e4a6b5",
  tiramisu: "#b38a68",
  legendary: "#dac29b",
};

export const WORLDS = [
  {
    id: "cozy",
    name: "Strawberry sunset",
    short: "Sunset",
    emoji: "☀",
    mood: "Cozy",
    line: "A little golden hour. A lot of strawberry.",
    colour: "#eb775f",
    scene: "#f5d4b0",
    accent: "#e86f55",
    sound: 261.63,
  },
  {
    id: "needahug",
    name: "Midnight blueberry",
    short: "Midnight",
    emoji: "☾",
    mood: "Need a Hug",
    line: "For the late-night thoughts and extra-soft scoops.",
    colour: "#8d85c7",
    scene: "#7970ab",
    accent: "#c5b6ee",
    sound: 196,
  },
  {
    id: "hungry",
    name: "The matcha café",
    short: "Matcha",
    emoji: "✳",
    mood: "Starving",
    line: "Slow down. Take a seat. Make it a double.",
    colour: "#829276",
    scene: "#c6d2a5",
    accent: "#5f7957",
    sound: 220,
  },
  {
    id: "celebration",
    name: "Party mode",
    short: "Party",
    emoji: "✧",
    mood: "Celebration",
    line: "Colourful scoops and extra sprinkles.",
    colour: "#c588ad",
    scene: "#e5b3cb",
    accent: "#b66791",
    sound: 329.63,
  },
];

export function expandScoops(cart, flavours) {
  return Object.entries(cart)
    .flatMap(([id, qty]) => {
      const flavour = flavours.find((item) => item.id === id);
      return flavour
        ? Array.from(
            {
              length: Math.max(
                0,
                Math.min(MAX_SCOOPS, Math.floor(Number(qty) || 0)),
              ),
            },
            (_, index) => ({
              ...flavour,
              key: `${id}-${index}`,
              colour: FLAVOUR_COLOURS[id] || "#f5dfb6",
            }),
          )
        : [];
    })
    .slice(0, MAX_SCOOPS);
}

export function countScoops(cart) {
  return Object.values(cart).reduce(
    (sum, qty) => sum + Math.max(0, Math.floor(Number(qty) || 0)),
    0,
  );
}

export function addScoop(cart, id) {
  if (countScoops(cart) >= MAX_SCOOPS) return cart;
  return { ...cart, [id]: (Number(cart[id]) || 0) + 1 };
}

export function shufflePairs(random = Math.random) {
  const pairs = ["🍓", "🍋", "🍵", "🍫", "🫐", "🥭"].flatMap((symbol, pair) =>
    [0, 1].map((copy) => ({ id: `${pair}-${copy}`, symbol, pair })),
  );
  for (let index = pairs.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [pairs[index], pairs[target]] = [pairs[target], pairs[index]];
  }
  return pairs;
}

export function isCaught(item, basket) {
  return item.y >= 78 && item.y <= 90 && Math.abs(item.x - basket) < 10;
}

export function safeProfile(value) {
  const fallback = {
    avatar: "🍦",
    moodId: "cozy",
    favorites: [],
    stamps: 0,
    orderHistory: [],
  };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fallback;
  return {
    avatar:
      typeof value.avatar === "string" && value.avatar.length < 12
        ? value.avatar
        : fallback.avatar,
    moodId: WORLDS.some((world) => world.id === value.moodId)
      ? value.moodId
      : fallback.moodId,
    favorites: Array.isArray(value.favorites)
      ? value.favorites.filter((id) => typeof id === "string").slice(0, 30)
      : [],
    stamps: Number.isFinite(value.stamps)
      ? Math.max(0, Math.floor(value.stamps))
      : 0,
    orderHistory: Array.isArray(value.orderHistory)
      ? value.orderHistory
          .filter(
            (order) =>
              order &&
              Array.isArray(order.items) &&
              order.items.every(
                (item) =>
                  item &&
                  typeof item.name === "string" &&
                  Number.isFinite(item.qty),
              ) &&
              Number.isFinite(order.total) &&
              Number.isFinite(order.time),
          )
          .slice(-30)
      : [],
  };
}
