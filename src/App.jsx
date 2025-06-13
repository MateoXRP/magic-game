// src/App.jsx

import { useState } from "react";
import GameProvider from "./context/GameProvider";
import GameBoard from "./components/GameBoard";
import StartScreen from "./components/StartScreen";

function App() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <GameProvider>
      <div className="min-h-screen bg-black text-white font-sans">
        {hasStarted ? (
          <GameBoard />
        ) : (
          <StartScreen onStart={() => setHasStarted(true)} />
        )}
      </div>
    </GameProvider>
  );
}

export default App;
