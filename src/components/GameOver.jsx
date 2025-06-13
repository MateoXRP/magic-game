// src/components/GameOver.jsx

import { useGame } from "../context/GameContext";

export default function GameOver({ onRestart }) {
  const { gameResult } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-white p-8 bg-black bg-opacity-80 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-4">
        {gameResult === "win" ? "🏆 You Win!" : "💀 You Lose!"}
      </h2>
      <p className="text-lg mb-6">Game Over</p>
      <button
        onClick={onRestart}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold"
      >
        🔁 Restart Game
      </button>
    </div>
  );
}
