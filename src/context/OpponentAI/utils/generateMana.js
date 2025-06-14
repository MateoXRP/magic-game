// src/context/OpponentAI/phases/generateMana.js

export function generateMana(battlefield) {
  const updatedBattlefield = [...battlefield];
  const mana = {
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  };

  for (const card of updatedBattlefield) {
    if (card.type === "land" && !card.tapped) {
      card.tapped = true;
      mana[card.color]++;
    }
  }

  const log = `🔥 Opponent taps ${Object.values(mana).reduce((a, b) => a + b, 0)} land(s) for mana: ` +
    Object.entries(mana)
      .filter(([_, val]) => val > 0)
      .map(([color, val]) => `${val} ${color}`)
      .join(", ");

  return {
    battlefield: updatedBattlefield,
    mana,
    log,
  };
}
