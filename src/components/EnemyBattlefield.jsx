// src/components/EnemyBattlefield.jsx
import { useGame } from "../context/GameContext";
import Card from "./Card";
import { isValidTarget } from "../utils";
import { resolveSpell } from "../context/PlayerActions";

export default function EnemyBattlefield() {
  const game = useGame();
  const {
    opponentBattlefield,
    selectedTarget,
    setSelectedTarget,
    pendingSpell,
    playerBattlefield,
  } = game;

  function handleClick(card) {
    if (
      pendingSpell &&
      isValidTarget(card, pendingSpell.targetType, playerBattlefield, opponentBattlefield)
    ) {
      resolveSpell(card.id, game);
    } else {
      setSelectedTarget(prev => (prev === card.id ? null : card.id));
    }
  }

  const creatures = opponentBattlefield.filter(c => c.type === "creature");

  const landGroups = opponentBattlefield
    .filter(c => c.type === "land")
    .reduce((acc, card) => {
      const key = card.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(card);
      return acc;
    }, {});

  const canTargetOpponent =
    pendingSpell?.targetType?.split("|").includes("opponent");

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[120px]">
        <h2 className="text-lg font-bold mb-4 text-center">Enemy Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(landGroups).map(([name, group]) => {
            const tappedCount = group.filter(c => c.tapped).length;
            return (
              <Card
                key={`${group[0].id}-group`}
                card={group[0]}
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
              isTargetable={
                pendingSpell &&
                isValidTarget(card, pendingSpell.targetType, playerBattlefield, opponentBattlefield)
              }
              battlefield={opponentBattlefield}
              label={card.tapped ? "tapped" : ""}
            />
          ))}

          {canTargetOpponent && (
            <div
              onClick={() => resolveSpell("opponent", game)}
              className="p-2 border border-yellow-400 border-4 rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center bg-red-900 text-white"
            >
              <div className="text-2xl">💀</div>
              <div className="font-bold text-sm mt-1">Opponent</div>
              <div className="text-xs italic mt-1">Life Target</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
