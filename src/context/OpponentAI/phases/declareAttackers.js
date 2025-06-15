// src/context/OpponentAI/phases/declareAttackers.js

import { getEffectiveAttack, getEffectiveDefense } from "../../../utils";

export function declareAttackers(battlefield, playerBattlefield, cpuLife = 20, playerLife = 20) {
  let totalDamage = 0;
  const updatedBattlefield = battlefield.map(card => ({ ...card, attacking: false }));

  const blockers = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);
  const attackers = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);

  const getAttack = (c) => getEffectiveAttack(c, battlefield);
  const getDefense = (c) => getEffectiveDefense(c, battlefield);

  const potentialAttackers = [];

  const totalAvailableAttackPower = attackers.reduce((sum, c) => sum + getAttack(c), 0);
  const playerBlockPower = blockers.reduce((sum, c) => sum + getAttack(c), 0);
  const swarmMode = attackers.length > blockers.length;
  const noBlockers = blockers.length === 0;

  const logLines = [];

  // ✅ 1. All-in if we can win right now
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

  // ✅ 2. Desperation swing if CPU is about to die anyway
  if (cpuLife <= playerBlockPower && blockers.length > 0) {
    for (const attacker of attackers) {
      attacker.attacking = true;
      totalDamage += getAttack(attacker);
    }
    return {
      battlefield: updatedBattlefield,
      totalDamage,
      log: `💀 Opponent swings all-in with ${attackers.length} creature(s) in desperation for ${totalDamage} damage.`,
    };
  }

  // ✅ 3. Smart selection of attackers
  for (const attacker of attackers) {
    const atkVal = getAttack(attacker);
    const defVal = getDefense(attacker);

    const killerBlockers = blockers.filter(b => getAttack(b) >= defVal);
    const wouldTrade = killerBlockers.some(b => atkVal >= getEffectiveDefense(b, playerBattlefield));
    const canSurvive = killerBlockers.length === 0;

    const isExpendable = atkVal <= 1 && defVal <= 1;

    const allowAttack =
      noBlockers ||
      canSurvive ||
      (isExpendable && wouldTrade) ||
      swarmMode;

    if (allowAttack) {
      potentialAttackers.push(attacker);
    }
  }

  const attackPower = potentialAttackers.reduce((sum, c) => sum + getAttack(c), 0);

  if (potentialAttackers.length === 0) {
    return {
      battlefield: updatedBattlefield,
      totalDamage: 0,
      log: "🛡️ Opponent holds all creatures back this turn.",
    };
  }

  for (const attacker of potentialAttackers) {
    attacker.attacking = true;
    totalDamage += getAttack(attacker);
    logLines.push(`⚔️ ${attacker.name} declared as attacker.`);
  }

  logLines.unshift(`⚔️ Opponent attacks with ${potentialAttackers.length} creature(s) for ${totalDamage} damage.`);

  return {
    battlefield: updatedBattlefield,
    totalDamage,
    log: logLines.join(" "),
  };
}
