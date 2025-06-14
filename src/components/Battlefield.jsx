// src/components/Battlefield.jsx
import { useGame } from "../context/GameContext";
import { useState, useEffect } from "react";
import Card from "./Card";
import { isValidTarget } from "../utils";
import { resolveSpell } from "../context/PlayerActions";

export default function Battlefield() {
  const game = useGame();
  const {
    playerBattlefield,
    setPlayerBattlefield,
    setManaPool,
    declareAttacker,
    blockingPhase,
    declaredAttackers,
    opponentBattlefield,
    blockAssignments,
    setBlockAssignments,
    pendingSpell,
    resolveCombat,
  } = game;

  const [selectedBlocker, setSelectedBlocker] = useState(null);

  useEffect(() => {
    if (!blockingPhase) setSelectedBlocker(null);
  }, [blockingPhase]);

  function handleClick(card, count = 1, tappedCount = 0) {
    if (
      pendingSpell &&
      isValidTarget(card, pendingSpell.targetType, playerBattlefield, opponentBattlefield)
    ) {
      resolveSpell(card.id, game);
      return;
    }

    if (blockingPhase) {
      if (card.type === "creature" && !card.tapped) {
        setSelectedBlocker(prev => (prev === card.id ? null : card.id));
      }
      return;
    }

    if (card.type === "creature") {
      declareAttacker(card.id);
    } else if (card.type === "land") {
      let tapped = false;

      const updated = playerBattlefield.map(c => {
        if (!tapped && c.type === "land" && c.name === card.name && !c.tapped) {
          tapped = true;
          return { ...c, tapped: true };
        }
        return c;
      });

      if (tapped) {
        setPlayerBattlefield(updated);
        setManaPool(prev => ({
          ...prev,
          [card.color]: (prev[card.color] || 0) + 1,
        }));
      }
    }
  }

  function assignBlock(attackerId) {
    if (!selectedBlocker) return;
    setBlockAssignments(prev => ({
      ...prev,
      [attackerId]: selectedBlocker,
    }));
    setSelectedBlocker(null);
  }

  const creatures = playerBattlefield.filter(c => c.type === "creature");

  const landGroups = playerBattlefield
    .filter(c => c.type === "land")
    .reduce((acc, card) => {
      const key = card.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(card);
      return acc;
    }, {});

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[180px]">
        <h2 className="text-lg font-bold mb-4 text-center">Your Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(landGroups).map(([name, group]) => {
            const tappedCount = group.filter(c => c.tapped).length;
            return (
              <Card
                key={`${group[0].id}-group`}
                card={group[0]}
                onClick={() =>
                  !blockingPhase &&
                  handleClick(group[0], group.length, tappedCount)
                }
                groupedCount={group.length}
                tappedCount={tappedCount}
              />
            );
          })}

          {creatures.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleClick(card)}
              battlefield={playerBattlefield}
              isSelected={selectedBlocker === card.id}
              isAssigned={Object.values(blockAssignments).includes(card.id)}
              isAttacking={card.attacking}
              isTargetable={
                pendingSpell &&
                isValidTarget(card, pendingSpell.targetType, playerBattlefield, opponentBattlefield)
              }
            />
          ))}
        </div>

        {blockingPhase && (
          <>
            <h3 className="text-sm mt-4 font-semibold text-blue-300 text-center">
              Select one of your untapped creatures above, then click an enemy attacker below to block:
            </h3>
            <div className="flex flex-wrap justify-center gap-2 mt-2 min-h-[130px]">
              {declaredAttackers.length === 0 ? (
                <div className="text-gray-400 italic text-center w-full">
                  No enemy attackers to block this turn.
                </div>
              ) : (
                declaredAttackers.map(attackerId => {
                  const attacker = opponentBattlefield.find(c => c.id === attackerId);
                  if (!attacker) return null;

                  const alreadyBlocked = !!blockAssignments[attackerId];

                  return (
                    <Card
                      key={attacker.id}
                      card={attacker}
                      onClick={alreadyBlocked ? null : () => assignBlock(attackerId)}
                      isTargetable={!alreadyBlocked}
                      dimmed={alreadyBlocked} // ✅ correct visual override
                      battlefield={opponentBattlefield}
                    />
                  );
                })
              )}
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={resolveCombat}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
              >
                Resolve Combat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
