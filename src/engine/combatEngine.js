// src/engine/combatEngine.js
import { getEffectiveAttack, getEffectiveDefense } from "../utils";

export function resolveCombatPhase(state) {
  const {
    playerBattlefield,
    opponentBattlefield,
    setPlayerBattlefield,
    setOpponentBattlefield,
    setGraveyard,
    setOpponentLife,
    setPlayerLife,
    setLog,
    blockingPhase,
    setBlockingPhase,
    declaredAttackers,
    setDeclaredAttackers,
    blockAssignments,
    setBlockAssignments,
    currentTurn,
    setTurnCount,
    setIsPlayerTurn,
    hasStartedTurn,
    isRunningCPU,
  } = state;

  const updatedPlayer = [...playerBattlefield];
  const updatedOpponent = [...opponentBattlefield];
  const grave = [];

  if (blockingPhase) {
    declaredAttackers.forEach(attackerId => {
      const attacker = updatedOpponent.find(c => c.id === attackerId);
      if (!attacker) return;

      const blockerId = blockAssignments[attackerId];
      const blocker = blockerId ? updatedPlayer.find(c => c.id === blockerId) : null;

      if (blockerId && blocker) {
        const attackerPower = getEffectiveAttack(attacker, updatedOpponent);
        const attackerToughness = getEffectiveDefense(attacker, updatedOpponent);

        const blockerPower = getEffectiveAttack(blocker, updatedPlayer);
        const blockerToughness = getEffectiveDefense(blocker, updatedPlayer);

        attacker.damageTaken = blockerPower;
        blocker.damageTaken = attackerPower;

        setLog(prev => [...prev, `🛡️ ${blocker.name} blocks ${attacker.name}.`]);

        if (attacker.damageTaken >= attackerToughness) grave.push(attacker);
        if (blocker.damageTaken >= blockerToughness) grave.push(blocker);
      } else if (blockerId) {
        setLog(prev => [...prev, `⚰️ ${attacker.name} was blocked, but blocker is gone.`]);
      } else {
        const damage = getEffectiveAttack(attacker, updatedOpponent);
        setPlayerLife(hp => Math.max(0, hp - damage));
        setLog(prev => [...prev, `💥 ${attacker.name} hits you for ${damage} damage.`]);
      }

      attacker.tapped = true;
    });
  } else {
    const attackers = updatedPlayer.filter(c => c.attacking);
    const blockers = updatedOpponent.filter(c => c.type === "creature" && !c.tapped);

    attackers.forEach(attacker => {
      const blocker = blockers.shift();
      if (blocker) {
        const attackerPower = getEffectiveAttack(attacker, updatedPlayer);
        const attackerToughness = getEffectiveDefense(attacker, updatedPlayer);

        const blockerPower = getEffectiveAttack(blocker, updatedOpponent);
        const blockerToughness = getEffectiveDefense(blocker, updatedOpponent);

        attacker.damageTaken = blockerPower;
        blocker.damageTaken = attackerPower;
        blocker.tapped = true;
        blocker.blocking = attacker.id;

        if (attacker.damageTaken >= attackerToughness) grave.push(attacker);
        if (blocker.damageTaken >= blockerToughness) grave.push(blocker);

        setLog(prev => [...prev, `🛡️ ${blocker.name} blocked ${attacker.name}.`]);
      } else {
        const damage = getEffectiveAttack(attacker, updatedPlayer);
        setOpponentLife(hp => Math.max(0, hp - damage));
        setLog(prev => [...prev, `💥 ${attacker.name} hits opponent for ${damage} damage.`]);
      }
    });
  }

  const remainingPlayer = updatedPlayer.filter(c => !grave.includes(c));
  const remainingOpponent = updatedOpponent.filter(c => !grave.includes(c));

  setPlayerBattlefield(
    remainingPlayer.map(c => ({
      ...c,
      attacking: false,
      tapped: c.tapped || c.attacking,
      blocking: null,
      damageTaken: 0,
      tempAttack: undefined,
      tempDefense: undefined,
    }))
  );

  setOpponentBattlefield(
    remainingOpponent.map(c => ({
      ...c,
      blocking: null,
      damageTaken: 0,
      tempAttack: undefined,
      tempDefense: undefined,
    }))
  );

  setGraveyard(prev => [...prev, ...grave]);

  if (blockingPhase) {
    setBlockingPhase(false);
    setDeclaredAttackers([]);
    setBlockAssignments({});

    if (currentTurn.current === "opponent") {
      setTimeout(() => {
        setTurnCount(prev => prev + 1);
        setIsPlayerTurn(true);
        hasStartedTurn.current = false;
        isRunningCPU.current = false;
        currentTurn.current = "player";
      }, 300);
    }
  }
}
