import { useGame } from "../context/GameContext";

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
          <div className="text-2xl">{getCardEmoji(card)}</div>
          <div className="font-bold text-sm">{card.name}</div>
          {card.type !== "land" && (
            <div className="text-xs mt-1">Cost: {card.manaCost} 🔥</div>
          )}
        </div>
      ))}
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
  if (card.name === "Goblin" || card.name === "Goblin Chief") return "👺";
  if (card.name === "Lightning Bolt") return "⚡";
  return "🎴";
}
