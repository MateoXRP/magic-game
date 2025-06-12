export const sampleDeck = [
  ...Array(20).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "land",
    name: "Mountain",
    color: "red",
  })),
  ...Array(10).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "creature",
    name: "Goblin",
    color: "red",
    manaCost: 1,
    attack: 1,
    defense: 1,
  })),
  ...Array(10).fill(null).map(() => ({
    id: crypto.randomUUID(),
    type: "spell",
    name: "Lightning Bolt",
    color: "red",
    manaCost: 1,
    damage: 3,
  })),
];
