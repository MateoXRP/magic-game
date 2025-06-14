// src/context/OpponentAI/utils/generateMana.js

export function generateMana(battlefield) {
  const untapped = battlefield.filter(c => c.type === "land" && !c.tapped);
  const mana = untapped.length;

  const updated = battlefield.map(c =>
    untapped.includes(c) ? { ...c, tapped: true } : c
  );

  return {
    battlefield: updated,
    mana,
    log: `🔥 Opponent taps ${mana} land(s) for mana.`,
  };
}

