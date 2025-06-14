// src/context/OpponentAI/utils/playLand.js

export function playLand(hand, battlefield) {
  const land = hand.find(c => c.type === "land");
  if (land) {
    return {
      hand: hand.filter(c => c.id !== land.id),
      battlefield: [...battlefield, { ...land, tapped: false }],
      playedLand: true,
      log: `🪨 Opponent plays ${land.name}.`,
    };
  }
  return { hand, battlefield, playedLand: false, log: null };
}

