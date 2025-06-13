// src/components/GameOver.jsx
import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function GameOver({ onRestart, playerName, onLogout }) {
  const { gameResult, resetGameState } = useGame();
  const [leaderboard, setLeaderboard] = useState([]);

  // Save result to Firestore
  useEffect(() => {
    const saveResult = async () => {
      if (!playerName) return;

      try {
        const ref = doc(db, "magic_leaderboard", playerName);
        const snapshot = await getDoc(ref);
        const prev = snapshot.exists() ? snapshot.data() : { wins: 0, losses: 0 };

        const updated = {
          name: playerName,
          wins: gameResult === "win" ? prev.wins + 1 : prev.wins,
          losses: gameResult === "loss" ? prev.losses + 1 : prev.losses,
          updatedAt: serverTimestamp(),
        };

        await setDoc(ref, updated);
      } catch (err) {
        console.error("❌ Failed to write leaderboard entry:", err);
      }
    };

    saveResult();
  }, [gameResult, playerName]);

  // Load leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const snapshot = await getDocs(collection(db, "magic_leaderboard"));
      const entries = snapshot.docs.map(doc => doc.data());

      const sorted = entries
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);

      setLeaderboard(sorted);
    };

    fetchLeaderboard();
  }, []);

  const handleRestart = () => {
    resetGameState();   // ✅ Reset full game context
    onRestart();        // ✅ Return to StartScreen
  };

  const handleSignOut = () => {
    resetGameState();   // ✅ Optional cleanup on sign out
    onLogout();         // ✅ Return to LoginScreen
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-white p-8 bg-black bg-opacity-80 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-4">
        {gameResult === "win" ? "🏆 You Win!" : "💀 You Lose!"}
      </h2>
      <p className="text-lg mb-6">Game Over</p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleRestart}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold"
        >
          🔁 Restart
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold"
        >
          🚪 Sign Out
        </button>
      </div>

      <div className="w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">🏆 Top Magic Game Players</h3>
        <ul className="space-y-1 text-sm">
          {leaderboard.map((entry, idx) => (
            <li key={entry.name} className="flex justify-between border-b border-gray-700 pb-1">
              <span>{idx + 1}. {entry.name}</span>
              <span>{entry.wins} wins</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
