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
  const { gameResult, resetGameState, log } = useGame();
  const [leaderboard, setLeaderboard] = useState([]);

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
    resetGameState();
    onRestart();
  };

  const handleSignOut = () => {
    resetGameState();
    onLogout();
  };

  const handleDownloadLogs = () => {
    const text = log.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "magic-game-log.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-white p-8 bg-black bg-opacity-80 rounded shadow-lg">
      <h2 className="text-3xl font-bold mb-4">
        {gameResult === "win" ? "🏆 You Win!" : "💀 You Lose!"}
      </h2>
      <p className="text-lg mb-6">Game Over</p>

      <div className="flex flex-wrap justify-center gap-4">
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
        <button
          onClick={handleDownloadLogs}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
        >
          📥 Download Logs
        </button>
      </div>

      <div className="w-full max-w-md mt-6 text-left">
        <h3 className="text-xl font-bold">🏆 Top Magic Game Players</h3>
        <hr className="my-2 border-gray-600" />
        <ul className="space-y-1 text-sm">
          {leaderboard.map((entry, idx) => (
            <li key={entry.name} className="flex justify-between">
              <span>{idx + 1}. {entry.name}</span>
              <span>{entry.wins} wins</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
