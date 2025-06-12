import { useGame } from "../context/GameContext";

export default function Battlefield() {
  const {
    playerBattlefield,
    setPlayerBattlefield,
    setManaPool,
    declareAttacker,
  } = useGame();

  function handleClick(cardName, cardType, cardId) {
    if (cardType === "creature") {
      declareAttacker(cardId);
      return;
    }

    if (cardType === "land") {
      let tapped = false;

      const updated = playerBattlefield.map(c => {
        if (!tapped && c.type === "land" && c.name === cardName && !c.tapped) {
          tapped = true;
          return { ...c, tapped: true };
        }
        return c;
      });

      if (tapped) {
        setPlayerBattlefield(updated);
        setManaPool(prev => prev + 1);
      }
    }
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

  function renderCard(card, count = 1, tappedCount = 0) {
    const isTappable = card.type === "land" ? tappedCount < count : true;
    const isFullyTapped = card.type === "land" ? tappedCount >= count : card.tapped;

    return (
      <div
        key={card.id + (count > 1 ? `-${count}` : "")}
        onClick={() => isTappable && handleClick(card.name, card.type, card.id)}
        className={`p-2 border rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center
          ${isFullyTapped ? "bg-gray-500 text-white" : getCardColor(card.color)}
          ${card.attacking ? "border-red-500 border-4" : ""}`}
      >
        <div className="text-2xl">{getCardEmoji(card)}</div>
        <div className="font-bold text-sm">{card.name}</div>
        {card.type === "creature" && (
          <div className="text-xs mt-1">{card.attack}/{card.defense}</div>
        )}
        {card.type === "land" && count > 1 && (
          <div className="text-xs mt-1">{count - tappedCount}</div>
        )}
        {card.attacking && (
          <div className="text-xs text-red-300">⚔️ Attacking</div>
        )}
        {isFullyTapped && card.type === "land" && (
          <div className="text-xs italic">all tapped</div>
        )}
        {card.tapped && card.type === "creature" && (
          <div className="text-xs italic text-white">tapped</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[180px]">
        <h2 className="text-lg font-bold mb-4 text-center">Your Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(landGroups).map(([name, group]) => {
            const first = group[0];
            const tappedCount = group.filter(c => c.tapped).length;
            return renderCard(first, group.length, tappedCount);
          })}
          {creatures.map(renderCard)}
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
