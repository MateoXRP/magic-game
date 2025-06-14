// src/context/PlayerActions/phases/declareBlocker.js

export function declareBlocker(blockerId, attackerId, state) {
  const {
    isPlayerTurn,
    blockingPhase,
    playerBattlefield,
    setBlockAssignments,
    blockAssignments,
    setLog,
  } = state;

  if (!isPlayerTurn || !blockingPhase) return;

  const blocker = playerBattlefield.find(c => c.id === blockerId);
  if (!blocker || blocker.tapped || blocker.type !== "creature") return;

  const newAssignments = { ...blockAssignments };

  // Toggle: if already blocking this attacker, remove
  if (newAssignments[blockerId] === attackerId) {
    delete newAssignments[blockerId];
    setLog(prev => [...prev, `🛑 ${blocker.name} stops blocking.`]);
  } else {
    newAssignments[blockerId] = attackerId;
    setLog(prev => [...prev, `🛡️ ${blocker.name} blocks attacker ${attackerId}.`]);
  }

  setBlockAssignments(newAssignments);
}
