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
      const updated = playerBattlefield.map(c =>
        c.id === cardId ? { ...c, tapped: true } : c
      );
      setPlayerBattlefield(updated);
      setManaPool(prev => prev + 1);
    }

    if (card.type === "creature") {
      declareAttacker(cardId);
    }
  }

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[120px]">
        <h2 className="text-lg font-bold mb-4 text-center">Your Battlefield</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
          {playerBattlefield.map((card) => (
            <div
              key={card.id}
              onClick={() => handleClick(card.id)}
              className={`p-2 border rounded cursor-pointer text-center w-[100px] h-[100px] ${
                card.tapped ? "bg-gray-500" : "bg-green-700"
              } ${card.attacking ? "border-red-500 border-4" : ""}`}
            >
              <div className="font-bold">{card.name}</div>
              {card.type === "creature" && (
                <div>{card.attack}/{card.defense}</div>
              )}
              {card.attacking && (
                <div className="text-sm text-red-300">⚔️ Attacking</div>
              )}
              {card.tapped && !card.attacking && (
                <div className="text-xs italic">tapped</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
