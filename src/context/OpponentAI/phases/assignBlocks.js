// src/context/OpponentAI/phases/assignBlocks.js

export function assignBlocks(playerAttackers, cpuBattlefield, cpuLife = 20) {
  const blockers = cpuBattlefield.filter(c => c.type === "creature" && !c.tapped && !c.attacking);
  const blockAssignments = {};
  const usedBlockers = new Set();
  const usedAttackers = new Set();

  const getAttack = (c) => (c.tempAttack || 0) + c.attack;
  const getDefense = (c) => (c.tempDefense || 0) + c.defense;

  const attackers = [...playerAttackers].filter(c => c.type === "creature");

  // Score matrix: [{ blockerId, attackerId, damagePrevented }]
  const scores = [];

  for (const blocker of blockers) {
    const bAtk = getAttack(blocker);
    const bDef = getDefense(blocker);

    for (const attacker of attackers) {
      const aAtk = getAttack(attacker);
      const aDef = getDefense(attacker);

      let damagePrevented = aAtk;

      // If attacker dies before doing damage, even better
      if (bAtk >= aDef) {
        damagePrevented = aAtk;
      }

      // Always track how much damage would be stopped by this block
      scores.push({
        blockerId: blocker.id,
        attackerId: attacker.id,
        damagePrevented,
      });
    }
  }

  // Sort score matrix by descending damage prevented
  scores.sort((a, b) => b.damagePrevented - a.damagePrevented);

  for (const { blockerId, attackerId } of scores) {
    if (usedBlockers.has(blockerId) || usedAttackers.has(attackerId)) continue;

    blockAssignments[attackerId] = blockerId;
    usedBlockers.add(blockerId);
    usedAttackers.add(attackerId);
  }

  return blockAssignments;
}
