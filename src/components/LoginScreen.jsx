// src/components/LoginScreen.jsx
import { useState } from "react";

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");

  const handleStart = () => {
    if (!name.trim()) return alert("Please enter your name.");
    onLogin(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">🧙 Welcome to Magic Game</h1>
      <input
        className="px-4 py-2 rounded text-black w-64"
        placeholder="Enter your name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button
        onClick={handleStart}
        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded text-xl"
      >
        🪄 Start Game
      </button>
    </div>
  );
}
