import { useGame } from "../context/GameContext";

export default function Hand() {
  const { hand, playCard } = useGame();

  return (
    <div className="flex flex-wrap gap-2">
      {hand.map((card) => (
        <div
          key={card.id}
          onClick={() => playCard(card)}
          className="p-2 border rounded bg-gray-800 cursor-pointer hover:bg-gray-700"
        >
          <div className="font-bold">{card.name}</div>
          {card.type !== "land" && (
            <div>Cost: {card.manaCost} 🔥</div>
          )}
        </div>
      ))}
    </div>
  );
}
