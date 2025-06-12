import { GameProvider } from "./context/GameContext";
import GameBoard from "./components/GameBoard";

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-black text-white font-sans">
        <GameBoard />
      </div>
    </GameProvider>
  );
}

export default App;
