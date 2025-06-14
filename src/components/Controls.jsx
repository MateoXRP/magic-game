import { useGame } from "../context/GameContext";

export default function Controls() {
  const {
    manaPool,
    endTurn,
    isPlayerTurn,
    resolveCombat,
    playerLife,
    opponentLife,
    playerColors,
  } = useGame();

  const colorEmojis = {
    red: "🔥",
    green: "🌲",
    blue: "💧",
    white: "✨",
    black: "💀",
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="space-y-4 w-full max-w-3xl text-center">
        {isPlayerTurn && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={resolveCombat}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded"
            >
              Resolve Combat
            </button>
            <button
              onClick={endTurn}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              End Turn
            </button>
          </div>
        )}

        <div className="mt-2 text-white text-sm">
          {playerColors.map(color => (
            <span key={color} className="mr-4">
              {colorEmojis[color]} {manaPool[color] || 0}
            </span>
          ))}
          <span className="mr-4">❤️ You: {playerLife}</span>
          <span>💀 Enemy: {opponentLife}</span>
        </div>
      </div>
    </div>
  );
}
