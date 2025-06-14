// src/context/OpponentAI/phases/declareAttackers.js

export function declareAttackers(battlefield, playerBattlefield) {
  let totalDamage = 0;
  const updatedBattlefield = battlefield.map(card => ({ ...card, attacking: false }));

  const blockers = playerBattlefield.filter(c => c.type === "creature");
  const attackers = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);

  const logLines = [];

  // Prioritize smart attack decisions
  for (const attacker of attackers) {
    const attackValue = (attacker.tempAttack || 0) + attacker.attack;
    const defenseValue = (attacker.tempDefense || 0) + attacker.defense;

    const potentialBlockers = blockers
      .map(b => ({
        ...b,
        totalAttack: (b.tempAttack || 0) + b.attack,
        totalDefense: (b.tempDefense || 0) + b.defense,
      }))
      .filter(b => b.totalAttack >= defenseValue); // can kill attacker

    // Attack if:
    // 1. No blockers available
    // 2. Blockers can't kill attacker
    // 3. Late game and attacker has 1 or less defense (expendable)
    if (
      blockers.length === 0 ||
      potentialBlockers.length === 0 ||
      defenseValue <= 1
    ) {
      attacker.attacking = true;
      totalDamage += attackValue;
      logLines.push(`⚔️ ${attacker.name} declared as attacker.`);
    }
  }

  if (totalDamage > 0) {
    logLines.unshift(`⚔️ Opponent attacks with ${totalDamage > 1 ? attackers.filter(a => a.attacking).length : 1} creature(s) for ${totalDamage} damage.`);
  }

  return {
    battlefield: updatedBattlefield,
    totalDamage,
    log: logLines.length ? logLines.join(" ") : null,
  };
}
