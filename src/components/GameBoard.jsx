import Hand from "./Hand";
import Controls from "./Controls";
import Battlefield from "./Battlefield";
import BattleLog from "./BattleLog";

export default function GameBoard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔥 Magic Game</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <Battlefield />
          <Controls />
          <Hand />
        </div>
        <BattleLog />
      </div>
    </div>
  );
}
