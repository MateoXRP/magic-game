// src/context/OpponentAI/phases/playLand.js

export function playLand(hand, battlefield) {
  const landIndex = hand.findIndex(c => c.type === "land");

  if (landIndex === -1) {
    return { hand, battlefield, playedLand: false };
  }

  const landCard = hand[landIndex];
  const updatedHand = [...hand];
  updatedHand.splice(landIndex, 1);

  const updatedBattlefield = [...battlefield, { ...landCard, tapped: false }];
  const log = `🪨 Opponent plays ${landCard.name}.`;

  return {
    hand: updatedHand,
    battlefield: updatedBattlefield,
    playedLand: true,
    log
  };
}
