// src/context/OpponentAI/phases/declareAttackers.js

export function declareAttackers(battlefield, playerBattlefield, cpuLife = 20) {
  let totalDamage = 0;
  const updatedBattlefield = battlefield.map(card => ({ ...card, attacking: false }));

  const blockers = playerBattlefield.filter(c => c.type === "creature");
  const attackers = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);

  const getAttack = (c) => (c.tempAttack || 0) + c.attack;
  const getDefense = (c) => (c.tempDefense || 0) + c.defense;

  const potentialAttackers = [];

  for (const attacker of attackers) {
    const atkVal = getAttack(attacker);
    const defVal = getDefense(attacker);

    const killerBlockers = blockers.filter(b => getAttack(b) >= defVal);
    const wouldTrade = killerBlockers.some(b => getDefense(b) <= atkVal);
    const isExpendable = defVal <= 1;

    if (
      blockers.length === 0 || // no blockers
      killerBlockers.length === 0 || // attacker survives
      (isExpendable && wouldTrade) // willing trade
    ) {
      potentialAttackers.push(attacker);
    }
  }

  const playerBlockPower = blockers.reduce((sum, c) => sum + getAttack(c), 0);
  const attackPower = potentialAttackers.reduce((sum, c) => sum + getAttack(c), 0);

  const logLines = [];

  // Defensive posture: CPU life low and can’t win
  if (cpuLife <= playerBlockPower && blockers.length > 0 && attackPower < cpuLife) {
    logLines.push("🛑 Opponent holds back attackers to avoid lethal.");
  } else {
    for (const attacker of potentialAttackers) {
      attacker.attacking = true;
      totalDamage += getAttack(attacker);
      logLines.push(`⚔️ ${attacker.name} declared as attacker.`);
    }

    if (totalDamage > 0) {
      logLines.unshift(`⚔️ Opponent attacks with ${potentialAttackers.length} creature(s) for ${totalDamage} damage.`);
    }
  }

  return {
    battlefield: updatedBattlefield,
    totalDamage,
    log: logLines.length ? logLines.join(" ") : null,
  };
}
