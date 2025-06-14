// src/context/OpponentAI/phases/declareAttackers.js

export function declareAttackers(battlefield) {
  const attackers = battlefield.filter(c => c.type === "creature" && !c.tapped);
  let total = 0;

  const updated = battlefield.map(c => {
    if (attackers.includes(c)) {
      total += c.attack;
      return { ...c, attacking: true, tapped: true };
    }
    return c;
  });

  return {
    battlefield: updated,
    totalDamage: total,
    log: attackers.length > 0
      ? `⚔️ Opponent attacks with ${attackers.length} creature(s) for ${total} damage.`
      : `⏭️ Opponent ends turn without attacking.`,
  };
}

