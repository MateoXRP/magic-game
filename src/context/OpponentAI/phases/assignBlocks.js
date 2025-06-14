// src/context/OpponentAI/phases/assignBlocks.js

export function assignBlocks(playerAttackers, cpuBattlefield) {
  const blockers = cpuBattlefield.filter(c => c.type === "creature" && !c.tapped && !c.attacking);
  const blockAssignments = {};
  const usedBlockers = new Set();

  // Sort attackers by highest attack first
  const sortedAttackers = [...playerAttackers].sort((a, b) => (b.tempAttack || b.attack) - (a.tempAttack || a.attack));

  for (const attacker of sortedAttackers) {
    const potentialBlockers = blockers.filter(b => !usedBlockers.has(b.id));

    // Sort blockers to find one that can kill attacker and survive if possible
    const bestBlocker = potentialBlockers.find(blocker => {
      const blockerAttack = (blocker.tempAttack || 0) + blocker.attack;
      const blockerDefense = (blocker.tempDefense || 0) + blocker.defense;
      const attackerAttack = (attacker.tempAttack || 0) + attacker.attack;
      const attackerDefense = (attacker.tempDefense || 0) + attacker.defense;

      // Blocker survives and attacker dies
      return blockerDefense > attackerAttack && blockerAttack >= attackerDefense;
    }) ||
    // Otherwise, try to trade
    potentialBlockers.find(blocker => {
      const blockerAttack = (blocker.tempAttack || 0) + blocker.attack;
      const attackerDefense = (attacker.tempDefense || 0) + attacker.defense;
      return blockerAttack >= attackerDefense;
    });

    if (bestBlocker) {
      blockAssignments[attacker.id] = bestBlocker.id;
      usedBlockers.add(bestBlocker.id);
    }
  }

  return blockAssignments;
}

