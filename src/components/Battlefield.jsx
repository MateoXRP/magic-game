import { useGame } from "../context/GameContext";

export default function Battlefield() {
  const {
    playerBattlefield,
    setPlayerBattlefield,
    setManaPool,
    declareAttacker,
  } = useGame();

  function handleClick(cardId) {
    const card = playerBattlefield.find(c => c.id === cardId);

    if (!card || card.tapped) return;

    if (card.type === "land") {
      setPlayerBattlefield(prev =>
        prev.map(c =>
          c.id === cardId ? { ...c, tapped: true } : c
        )
      );
      setManaPool(prev => prev + 1);
      return;
    }

    if (card.type === "creature") {
      declareAttacker(cardId);
    }
  }

  const creatures = playerBattlefield.filter(c => c.type === "creature");
  const lands = playerBattlefield.filter(c => c.type === "land");

  function renderCard(card) {
    return (
      <div
        key={card.id}
        onClick={() => handleClick(card.id)}
        className={`p-2 border rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center
          ${card.tapped ? "bg-gray-500 text-white" : getCardColor(card.color)}
          ${card.attacking ? "border-red-500 border-4" : ""}`}
      >
        <div className="text-2xl">{getCardEmoji(card)}</div>
        <div className="font-bold text-sm">{card.name}</div>
        {card.type === "creature" && (
          <div className="text-xs mt-1">{card.attack}/{card.defense}</div>
        )}
        {card.attacking && (
          <div className="text-xs text-red-300">⚔️ Attacking</div>
        )}
        {card.tapped && card.type === "land" && (
          <div className="text-xs italic">tapped</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[180px]">
        <h2 className="text-lg font-bold mb-4 text-center">Your Battlefield</h2>
        <div className="space-y-4">
          {creatures.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {creatures.map(renderCard)}
            </div>
          )}
          {lands.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {lands.map(renderCard)}
            </div>
          )}
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
