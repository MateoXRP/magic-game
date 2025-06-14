// src/context/OpponentAI/phases/declareAttackers.js

export function declareAttackers(battlefield, playerBattlefield = []) {
  const attackers = [];
  let total = 0;

  const untappedCreatures = battlefield.filter(c => c.type === "creature" && !c.tapped);
  const availableBlockers = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);

  for (const creature of untappedCreatures) {
    let shouldAttack = false;

    if (availableBlockers.length === 0) {
      // No blockers — always attack
      shouldAttack = true;
    } else {
      // Simulate worst-case block for this attacker
      const sortedBlockers = [...availableBlockers].sort((a, b) => b.defense - a.defense);
      const worstBlocker = sortedBlockers[0];

      // If attacker can survive or trade favorably, allow attack
      const attack = (creature.tempAttack || 0) + creature.attack;
      const defense = (creature.tempDefense || 0) + creature.defense;

      if (attack >= worstBlocker.defense || defense > worstBlocker.attack) {
        shouldAttack = true;
      }
    }

    if (shouldAttack) {
      attackers.push(creature);
      total += (creature.tempAttack || 0) + creature.attack;
    }
  }

  const updated = battlefield.map(c => {
    if (attackers.includes(c)) {
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
