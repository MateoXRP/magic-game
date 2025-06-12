// src/components/EnemyBattlefield.jsx
import { useGame } from "../context/GameContext";
import Card from "./Card";

export default function EnemyBattlefield() {
  const { opponentBattlefield, selectedTarget, setSelectedTarget } = useGame();

  function toggleTarget(cardId) {
    setSelectedTarget(prev => (prev === cardId ? null : cardId));
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

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[120px]">
        <h2 className="text-lg font-bold mb-4 text-center">Enemy Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {/* Grouped lands */}
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

          {/* Enemy creatures */}
          {creatures.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={() => toggleTarget(card.id)}
              isTargetable={selectedTarget === card.id}
              battlefield={opponentBattlefield}
              label={card.tapped ? "tapped" : ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
