// src/App.jsx
import GameProvider from "./context/GameProvider";
import StartScreen from "./components/StartScreen";
import GameBoard from "./components/GameBoard";
import { useState } from "react";

export default function App({ playerName, onLogout }) {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <GameProvider>
      {hasStarted ? (
        <GameBoard
          onRestart={() => setHasStarted(false)}
          playerName={playerName}
          onLogout={onLogout} // ✅ Pass through
        />
      ) : (
        <StartScreen onStart={() => setHasStarted(true)} />
      )}
    </GameProvider>
  );
}
