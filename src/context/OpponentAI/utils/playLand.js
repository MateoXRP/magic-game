// src/context/OpponentAI/phases/playLand.js

export function playLand(hand, battlefield) {
  // Identify colors already on the battlefield
  const currentColors = new Set(
    battlefield.filter(c => c.type === "land").map(c => c.color)
  );

  // Prefer lands that add new colors
  let prioritizedIndex = hand.findIndex(c =>
    c.type === "land" && !currentColors.has(c.color)
  );

  // Fallback: just play any land
  if (prioritizedIndex === -1) {
    prioritizedIndex = hand.findIndex(c => c.type === "land");
  }

  if (prioritizedIndex === -1) {
    return { hand, battlefield, playedLand: false };
  }

  const landCard = hand[prioritizedIndex];
  const updatedHand = [...hand];
  updatedHand.splice(prioritizedIndex, 1);

  const updatedBattlefield = [...battlefield, { ...landCard, tapped: false }];
  const log = `🪨 Opponent plays ${landCard.name}.`;

  return {
    hand: updatedHand,
    battlefield: updatedBattlefield,
    playedLand: true,
    log,
  };
}
