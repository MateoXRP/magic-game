// src/context/OpponentAI/phases/assignBlocks.js

export function assignBlocks(playerAttackers, cpuBattlefield, cpuLife = 20) {
  const blockers = cpuBattlefield.filter(c => c.type === "creature" && !c.tapped && !c.attacking);
  const attackers = [...playerAttackers].filter(c => c.type === "creature");

  const blockAssignments = {};
  const assignedAttackers = new Set();
  const assignedBlockers = new Set();

  const getAttack = (c) => (c.tempAttack || 0) + c.attack;
  const getDefense = (c) => (c.tempDefense || 0) + c.defense;

  const totalUnblockedDamage = attackers.reduce((sum, a) => sum + getAttack(a), 0);

  // Build a score list of all possible blocker-attacker pairs
  const scoreMatrix = [];

  for (const blocker of blockers) {
    const bAtk = getAttack(blocker);
    const bDef = getDefense(blocker);

    for (const attacker of attackers) {
      const aId = attacker.id;
      const aAtk = getAttack(attacker);
      const aDef = getDefense(attacker);

      let score = aAtk; // base score = damage prevented

      const canKill = bAtk >= aDef;
      const canSurvive = bDef > aAtk;

      // Bonus: kill and survive
      if (canKill && canSurvive) score += 1.0;
      else if (canKill) score += 0.5;
      else if (canSurvive) score += 0.25;

      // Extra weight: attacker is lethal threat
      if (aAtk >= cpuLife) score += 2.0;

      // Extra weight: attacker is 3+ power (efficient block)
      if (aAtk >= 3) score += 0.5;

      scoreMatrix.push({
        blockerId: blocker.id,
        attackerId: aId,
        score,
      });
    }
  }

  // Sort by descending score — globally best matches come first
  scoreMatrix.sort((a, b) => b.score - a.score);

  // Assign each blocker to attacker greedily based on max score
  for (const { blockerId, attackerId } of scoreMatrix) {
    if (assignedBlockers.has(blockerId)) continue;
    if (assignedAttackers.has(attackerId)) continue;

    blockAssignments[attackerId] = blockerId;
    assignedBlockers.add(blockerId);
    assignedAttackers.add(attackerId);
  }

  return blockAssignments;
}
