// src/components/EnemyBattlefield.jsx
import { useGame } from "../context/GameContext";
import { getCardColor, getEffectiveAttack } from "../utils";

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

  function renderGroupedLand(card, count, tappedCount) {
    const isFullyTapped = tappedCount >= count;

    return (
      <div
        key={card.id + "-group"}
        className={`p-2 border rounded w-[100px] h-[120px] text-center flex flex-col justify-center
          ${isFullyTapped ? "bg-gray-500 text-white" : getCardColor(card.color)}`}
      >
        <div className="text-2xl">{card.emoji}</div>
        <div className="font-bold text-sm">{card.name}</div>
        {count > 1 && (
          <div className="text-xs mt-1">{count - tappedCount}</div>
        )}
        {isFullyTapped && (
          <div className="text-xs italic">all tapped</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[120px]">
        <h2 className="text-lg font-bold mb-4 text-center">Enemy Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {/* Render grouped lands */}
          {Object.entries(landGroups).map(([name, group]) => {
            const first = group[0];
            const tappedCount = group.filter(c => c.tapped).length;
            return renderGroupedLand(first, group.length, tappedCount);
          })}

          {/* Render individual creatures */}
          {creatures.map(card => {
            const isSelected = selectedTarget === card.id;
            return (
              <div
                key={card.id}
                onClick={() => toggleTarget(card.id)}
                className={`p-2 border rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center
                  ${isSelected ? "border-yellow-400 border-4" : "border-gray-500"}
                  ${card.tapped ? "bg-gray-500 text-white" : getCardColor(card.color)}`}
              >
                <div className="text-2xl">{card.emoji}</div>
                <div className="font-bold text-sm">{card.name}</div>
                <div className="text-xs mt-1">{getEffectiveAttack(card, opponentBattlefield)}/{card.defense}</div>
                {card.tapped && <div className="text-xs italic">tapped</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
