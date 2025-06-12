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
      resolveSpell(card.id, game); // ✅ pass full context
      return;
    }

    if (blockingPhase) {
      if (!card.tapped && card.type === "creature") {
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
                onClick={() => handleClick(group[0], group.length, tappedCount)}
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
              label={card.tapped && !card.attacking ? "tapped" : ""}
            />
          ))}
        </div>

        {blockingPhase && selectedBlocker && (
          <>
            <h3 className="text-sm mt-4 font-semibold text-blue-300 text-center">Choose enemy to block:</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {declaredAttackers.map(attackerId => {
                const attacker = opponentBattlefield.find(c => c.id === attackerId);
                if (!attacker) return null;
                return (
                  <Card
                    key={attacker.id}
                    card={attacker}
                    onClick={() => assignBlock(attacker.id)}
                    isTargetable
                    battlefield={opponentBattlefield}
                    label={attacker.tapped ? "tapped" : ""}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
