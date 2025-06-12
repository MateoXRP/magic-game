// src/components/GameBoard.jsx

import { useGame } from "../context/GameContext";
import Hand from "./Hand";
import Controls from "./Controls";
import Battlefield from "./Battlefield";
import EnemyBattlefield from "./EnemyBattlefield";
import BattleLog from "./BattleLog";
import GameOver from "./GameOver";

export default function GameBoard() {
  const { gameOver } = useGame();

  return (
    <div className="p-4">
      {/* Top title bar */}
      <div className="bg-gray-800 text-white px-4 py-2 text-xl font-bold w-full text-left rounded-t">
        🔥 Magic Game
      </div>

      {gameOver ? (
        // ✅ Show GameOver component
        <div className="flex justify-center items-center min-h-[400px]">
          <GameOver />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* LEFT SIDE: All game components */}
          <div className="flex-1 space-y-4">
            <EnemyBattlefield />
            <Battlefield />
            <Controls />
            <Hand />
          </div>

          {/* RIGHT SIDE: Battle Log */}
          <BattleLog />
        </div>
      )}
    </div>
  );
}
