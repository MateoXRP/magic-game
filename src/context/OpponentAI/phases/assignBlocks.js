// src/context/OpponentAI/phases/assignBlocks.js

export function assignBlocks(playerAttackers, cpuBattlefield, cpuLife = 20) {
  const blockers = cpuBattlefield.filter(c => c.type === "creature" && !c.tapped && !c.attacking);
  const blockAssignments = {};
  const usedBlockers = new Set();

  // Sort attackers by descending power
  const sortedAttackers = [...playerAttackers].sort(
    (a, b) => ((b.tempAttack || 0) + b.attack) - ((a.tempAttack || 0) + a.attack)
  );

  for (const attacker of sortedAttackers) {
    const potentialBlockers = blockers.filter(b => !usedBlockers.has(b.id));
    const attackerAttack = (attacker.tempAttack || 0) + attacker.attack;
    const attackerDefense = (attacker.tempDefense || 0) + attacker.defense;

    // 1. Ideal block: kill attacker and survive
    let blocker = potentialBlockers.find(b => {
      const bAtk = (b.tempAttack || 0) + b.attack;
      const bDef = (b.tempDefense || 0) + b.defense;
      return bAtk >= attackerDefense && bDef > attackerAttack;
    });

    // 2. Trade: both die
    if (!blocker) {
      blocker = potentialBlockers.find(b => {
        const bAtk = (b.tempAttack || 0) + b.attack;
        return bAtk >= attackerDefense;
      });
    }

    // 3. Chump block: prevent high damage or lethal
    if (!blocker && attackerAttack >= 3) {
      blocker = potentialBlockers[0]; // Any available blocker
    }

    // 4. Emergency block to prevent lethal
    if (!blocker && attackerAttack >= cpuLife) {
      blocker = potentialBlockers[0];
    }

    if (blocker) {
      blockAssignments[attacker.id] = blocker.id;
      usedBlockers.add(blocker.id);
    }
  }

  return blockAssignments;
}
