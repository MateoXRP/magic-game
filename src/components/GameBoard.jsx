import Hand from "./Hand";
import Controls from "./Controls";
import Battlefield from "./Battlefield";

export default function GameBoard() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">🔥 Magic Game</h1>
      <Battlefield />
      <Controls />
      <Hand />
    </div>
  );
}
