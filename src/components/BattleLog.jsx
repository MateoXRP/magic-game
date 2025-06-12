import { useGame } from "../context/GameContext";

export default function BattleLog() {
  const { log } = useGame();

  return (
    <div className="w-full md:w-72 bg-gray-900 text-white p-4 overflow-y-auto border-l border-gray-700 max-h-[80vh]">
      <h2 className="text-lg font-bold mb-2">📜 Battle Log</h2>
      <ul className="space-y-1 text-sm">
        {[...log].reverse().map((entry, idx) => (
          <li key={idx} className="border-b border-gray-700 pb-1">{entry}</li>
        ))}
      </ul>
    </div>
  );
}
