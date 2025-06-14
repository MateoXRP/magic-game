// src/context/OpponentAI/useBlockerAI.js

import { useEffect, useRef } from "react";
import { assignBlocks } from "./phases/assignBlocks";

export default function useBlockerAI(state) {
  const {
    blockingPhase,
    isPlayerTurn,
    declaredAttackers,
    playerBattlefield,
    opponentBattlefield,
    setBlockAssignments,
    setBlockingPhase,
    setLog,
  } = state;

  const hasBlocked = useRef(false);

  useEffect(() => {
    // Only run CPU blocker logic when PLAYER is attacking
    if (blockingPhase && isPlayerTurn && !hasBlocked.current) {
      hasBlocked.current = true;

      setTimeout(() => {
        const attackers = opponentBattlefield.filter(c => declaredAttackers.includes(c.id));
        const blockers = playerBattlefield;

        const assignments = assignBlocks(attackers, blockers);
        const logMessages = [];

        if (Object.keys(assignments).length === 0) {
          logMessages.push(`⛔ You choose not to block.`);
        } else {
          for (const [attackerId, blockerId] of Object.entries(assignments)) {
            const attacker = attackers.find(c => c.id === attackerId);
            const blocker = blockers.find(c => c.id === blockerId);

            if (attacker && blocker) {
              logMessages.push(`🛡️ ${blocker.name} blocks ${attacker.name}.`);
            }
          }
        }

        setBlockAssignments(assignments);
        setLog(prev => [...prev, ...logMessages]);
        setBlockingPhase(false);
        hasBlocked.current = false;
      }, 600);
    }
  }, [blockingPhase, isPlayerTurn, declaredAttackers, playerBattlefield, opponentBattlefield]);
}
