// src/components/GameBoard.jsx
import { useGame } from "../context/GameContext";
import Hand from "./Hand";
import Controls from "./Controls";
import Battlefield from "./Battlefield";
import EnemyBattlefield from "./EnemyBattlefield";
import BattleLog from "./BattleLog";
import GameOver from "./GameOver";

export default function GameBoard({ onRestart, playerName, onLogout }) {
  const { gameOver } = useGame();

  return (
    <div className="bg-black min-h-screen p-4 text-white">
      <div className="bg-gray-800 text-white px-4 py-2 text-xl font-bold w-full text-left rounded-t">
        🔥 Magic Game
      </div>

      {gameOver ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <GameOver
            onRestart={onRestart}
            playerName={playerName}
            onLogout={onLogout} // ✅ Pass through
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <EnemyBattlefield />
            <Battlefield />
            <Controls />
            <Hand />
          </div>
          <BattleLog />
        </div>
      )}
    </div>
  );
}
