// src/context/OpponentAI/phases/declareAttackers.js

export function declareAttackers(battlefield, opponentBattlefield) {
  const updatedBattlefield = battlefield.map(c => ({ ...c, attacking: false }));

  const attackers = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);
  const blockers = opponentBattlefield.filter(c => c.type === "creature" && !c.tapped);

  let totalDamage = 0;
  const logMessages = [];

  if (attackers.length === 0) {
    logMessages.push("⏭️ Opponent ends turn without attacking.");
    return {
      battlefield: updatedBattlefield,
      totalDamage,
      log: logMessages.join("\n"),
    };
  }

  // Basic swarm logic: if CPU has more creatures than the player OR player has no blockers
  const shouldSwarm =
    blockers.length === 0 || attackers.length > blockers.length + 1;

  if (shouldSwarm) {
    attackers.forEach(c => {
      c.attacking = true;
      totalDamage += c.attack || 0;
      logMessages.push(`⚔️ ${c.name} declared as attacker.`);
    });
  } else {
    // Conservative attack logic (unchanged)
    for (const attacker of attackers) {
      if (blockers.length === 0 || attacker.attack > 2) {
        attacker.attacking = true;
        totalDamage += attacker.attack || 0;
        logMessages.push(`⚔️ ${attacker.name} declared as attacker.`);
      }
    }
  }

  if (totalDamage === 0) {
    logMessages.push("⏭️ Opponent ends turn without attacking.");
  } else {
    logMessages.unshift(`⚔️ Opponent attacks with ${totalDamage > 0 ? attackers.filter(c => c.attacking).length : 0} creature(s) for ${totalDamage} damage.`);
  }

  return {
    battlefield: updatedBattlefield,
    totalDamage,
    log: logMessages.join("\n"),
  };
}
