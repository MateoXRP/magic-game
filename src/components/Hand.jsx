// src/components/Hand.jsx
import { useGame } from "../context/GameContext";
import { getCardColor } from "../utils";

export default function Hand() {
  const { hand, playCard } = useGame();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {hand.map((card) => (
        <div
          key={card.id}
          onClick={() => playCard(card)}
          className={`p-2 border rounded cursor-pointer hover:brightness-110 w-[100px] h-[120px] text-center flex flex-col justify-center ${getCardColor(card.color)}`}
        >
          <div className="text-2xl">{card.emoji}</div>
          <div className="font-bold text-sm">{card.name}</div>
          {card.type !== "land" && (
            <div className="text-xs mt-1">Cost: {card.manaCost} 🔥</div>
          )}
        </div>
      ))}
    </div>
  );
}
