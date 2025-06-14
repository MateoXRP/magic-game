// src/context/OpponentAI/utils/generateMana.js

export function generateMana(battlefield) {
  const untapped = battlefield.filter(c => c.type === "land" && !c.tapped);

  const updated = battlefield.map(c =>
    untapped.includes(c) ? { ...c, tapped: true } : c
  );

  const manaPool = {
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  };

  for (const land of untapped) {
    if (land.color && manaPool.hasOwnProperty(land.color)) {
      manaPool[land.color]++;
    }
  }

  const log =
    `🔥 Opponent taps ${untapped.length} land(s) for mana: ` +
    Object.entries(manaPool)
      .filter(([_, v]) => v > 0)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ");

  return {
    battlefield: updated,
    mana: manaPool,
    log,
  };
}
