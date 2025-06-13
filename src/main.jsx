// src/main.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import "./index.css";

function Root() {
  const [playerName, setPlayerName] = useState(null);

  const handleLogout = () => setPlayerName(null); // ✅ Reset to login screen

  return playerName ? (
    <App playerName={playerName} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={setPlayerName} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
