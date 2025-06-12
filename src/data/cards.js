export const sampleDeck = [
  // 🔴 RED LAND (8)
  ...Array(8).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "land",
    name: "Mountain",
    color: "red",
    emoji: "⛰️",
  })),

  // 🔴 RED NONLAND (12)
  ...Array(5).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "creature",
    name: "Goblin",
    color: "red",
    manaCost: 1,
    attack: 1,
    defense: 1,
    emoji: "👺",
  })),
  ...Array(3).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "creature",
    name: "Goblin Chief",
    color: "red",
    manaCost: 2,
    attack: 2,
    defense: 2,
    special: "All other Goblins get +1 attack while this is in play.",
    emoji: "👺",
  })),
  ...Array(4).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "spell",
    name: "Lightning Bolt",
    color: "red",
    manaCost: 1,
    damage: 3,
    emoji: "⚡",
  })),

  // 🟢 GREEN LAND (8)
  ...Array(8).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "land",
    name: "Forest",
    color: "green",
    emoji: "🌲",
  })),

  // 🟢 GREEN NONLAND (12)
  ...Array(4).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "creature",
    name: "Elvish Scout",
    color: "green",
    manaCost: 1,
    attack: 1,
    defense: 1,
    emoji: "🧝",
  })),
  ...Array(3).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "creature",
    name: "Forest Bear",
    color: "green",
    manaCost: 2,
    attack: 2,
    defense: 2,
    emoji: "🐻",
  })),
  ...Array(2).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "creature",
    name: "Ancient Treefolk",
    color: "green",
    manaCost: 3,
    attack: 3,
    defense: 3,
    emoji: "🌳",
  })),
  ...Array(3).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "spell",
    name: "Giant Growth",
    color: "green",
    manaCost: 1,
    effect: "boost",
    boost: { attack: 3, defense: 3 },
    emoji: "🌿",
  })),
];
