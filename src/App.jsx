// src/App.jsx

import { useState } from "react";
import GameProvider from "./context/GameProvider";
import GameBoard from "./components/GameBoard";
import StartScreen from "./components/StartScreen";
import { useGame } from "./context/GameContext";

function AppWrapper() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <GameProvider>
      <GameApp hasStarted={hasStarted} setHasStarted={setHasStarted} />
    </GameProvider>
  );
}

function GameApp({ hasStarted, setHasStarted }) {
  const { resetGameState } = useGame();

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {hasStarted ? (
        <GameBoard
          onRestart={() => {
            resetGameState();
            setHasStarted(false);
          }}
        />
      ) : (
        <StartScreen onStart={() => setHasStarted(true)} />
      )}
    </div>
  );
}

export default AppWrapper;
