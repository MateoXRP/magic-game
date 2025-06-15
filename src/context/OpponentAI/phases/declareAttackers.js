// src/context/OpponentAI/phases/declareAttackers.js

export function declareAttackers(battlefield, playerBattlefield, cpuLife = 20, playerLife = 20) {
  let totalDamage = 0;
  const updatedBattlefield = battlefield.map(card => ({ ...card, attacking: false }));

  const blockers = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);
  const attackers = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);

  const getAttack = (c) => (c.tempAttack || 0) + c.attack;
  const getDefense = (c) => (c.tempDefense || 0) + c.defense;

  const potentialAttackers = [];

  const totalAvailableAttackPower = attackers.reduce((sum, c) => sum + getAttack(c), 0);

  // ✅ Lethal check: if we can win, swing all
  if (totalAvailableAttackPower >= playerLife) {
    for (const attacker of attackers) {
      attacker.attacking = true;
      totalDamage += getAttack(attacker);
    }
    return {
      battlefield: updatedBattlefield,
      totalDamage,
      log: `⚔️ Opponent attacks all-in for lethal with ${attackers.length} creature(s) for ${totalDamage} damage.`,
    };
  }

  const playerBlockPower = blockers.reduce((sum, c) => sum + getAttack(c), 0);
  const swarmMode = attackers.length > blockers.length;

  for (const attacker of attackers) {
    const atkVal = getAttack(attacker);
    const defVal = getDefense(attacker);

    const killerBlockers = blockers.filter(b => getAttack(b) >= defVal);
    const wouldTrade = killerBlockers.some(b => getDefense(b) <= atkVal);
    const isExpendable = defVal <= 1;

    const noBlockers = blockers.length === 0;

    // ✅ Safe attack conditions
    if (
      noBlockers ||
      killerBlockers.length === 0 ||      // survives combat
      (isExpendable && wouldTrade) ||     // willing to trade
      swarmMode                           // aggression mode
    ) {
      potentialAttackers.push(attacker);
    }
  }

  const attackPower = potentialAttackers.reduce((sum, c) => sum + getAttack(c), 0);

  const logLines = [];

  // ✅ Defensive posture
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
