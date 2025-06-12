import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function EnemyBattlefield() {
  const { opponentBattlefield } = useGame();
  const [selectedTargets, setSelectedTargets] = useState([]);

  function toggleTarget(cardId) {
    setSelectedTargets(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId) // unselect
        : [...prev, cardId] // select
    );
  }

  const creatures = opponentBattlefield.filter(c => c.type === "creature");

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[120px]">
        <h2 className="text-lg font-bold mb-4 text-center">Enemy Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {creatures.map(card => {
            const isSelected = selectedTargets.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => toggleTarget(card.id)}
                className={`p-2 border rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center
                  ${isSelected ? "border-red-500 border-4" : "border-gray-500"}
                  ${card.tapped ? "bg-gray-500 text-white" : getCardColor(card.color)}`}
              >
                <div className="text-2xl">{getCardEmoji(card)}</div>
                <div className="font-bold text-sm">{card.name}</div>
                <div className="text-xs mt-1">{card.attack}/{card.defense}</div>
                {card.tapped && (
                  <div className="text-xs italic">tapped</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getCardColor(color) {
  switch (color) {
    case "red":
      return "bg-red-700 text-white";
    case "blue":
      return "bg-blue-700 text-white";
    case "green":
      return "bg-green-700 text-white";
    case "white":
      return "bg-yellow-200 text-black";
    case "black":
      return "bg-gray-800 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

function getCardEmoji(card) {
  if (card.name === "Mountain") return "⛰️";
  if (card.name === "Goblin") return "👺";
  if (card.name === "Lightning Bolt") return "⚡";
  return "🎴";
}

