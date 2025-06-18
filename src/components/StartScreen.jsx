// src/components/StartScreen.jsx

import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import {
  redDeck,
  greenDeck,
  blueDeck,
  whiteDeck,
  blackDeck,
} from "../data/cards";
import { createDualColorDeck } from "../data/deckbuilder";

const colorData = {
  red: { name: "Red", emoji: "🔥", deck: redDeck },
  green: { name: "Green", emoji: "🌲", deck: greenDeck },
  blue: { name: "Blue", emoji: "💧", deck: blueDeck },
  white: { name: "White", emoji: "✨", deck: whiteDeck },
  black: { name: "Black", emoji: "💀", deck: blackDeck },
};

const allColors = Object.keys(colorData);

export default function StartScreen({ onStart }) {
  const {
    setPlayerColors,
    setHand,
    setLibrary,
    setOpponentHand,
    setOpponentLibrary,
    setLog,
  } = useGame();

  const [playerChoices, setPlayerChoices] = useState([]);
  const [cpuChoices, setCpuChoices] = useState(["", ""]);
  const [rolling, setRolling] = useState(false);
  const [ready, setReady] = useState(false);

  function toggleColor(color) {
    setPlayerChoices(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : prev.length < 2
        ? [...prev, color]
        : prev
    );
  }

  function startCpuRoll() {
    setRolling(true);
    const interval = setInterval(() => {
      const random1 = allColors[Math.floor(Math.random() * allColors.length)];
      const random2 = allColors[Math.floor(Math.random() * allColors.length)];
      setCpuChoices([random1, random2]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      let finalChoices = [];

      while (
        finalChoices.length < 2 ||
        new Set([...finalChoices, ...playerChoices]).size < 4
      ) {
        const pick = allColors[Math.floor(Math.random() * allColors.length)];
        if (!finalChoices.includes(pick)) {
          finalChoices.push(pick);
        }
      }

      setCpuChoices(finalChoices);
      setRolling(false);
      setReady(true);
      buildDecks(playerChoices, finalChoices);
    }, 2000);
  }

  function buildDecks(playerColors, cpuColors) {
    setPlayerColors(playerColors);
    const deckA = colorData[playerColors[0]].deck;
    const deckB = colorData[playerColors[1]].deck;
    const fullPlayerDeck = createDualColorDeck(deckA, deckB);
    setHand(fullPlayerDeck.slice(0, 7));
    setLibrary(fullPlayerDeck.slice(7));

    const cpuDeckA = colorData[cpuColors[0]].deck;
    const cpuDeckB = colorData[cpuColors[1]].deck;
    const fullCpuDeck = createDualColorDeck(cpuDeckA, cpuDeckB);
    setOpponentHand(fullCpuDeck.slice(0, 7));
    setOpponentLibrary(fullCpuDeck.slice(7));

    setLog(prev => [
      ...prev,
      `🃏 Your opening hand: ${fullPlayerDeck.slice(0, 7).map(c => c.name).join(", ")}`,
      `🃏 Opponent draws their opening hand.`,
    ]);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 space-y-4">
      <h1 className="text-3xl font-bold">🎴 Choose Your Deck Colors</h1>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {allColors.map(color => (
          <button
            key={color}
            onClick={() => toggleColor(color)}
            className={`px-4 py-2 rounded border ${
              playerChoices.includes(color)
                ? "border-yellow-400 bg-gray-800"
                : "border-gray-600 bg-gray-700"
            }`}
            disabled={rolling}
          >
            {colorData[color].emoji} {colorData[color].name}
          </button>
        ))}
      </div>

      <button
        disabled={playerChoices.length !== 2 || rolling}
        onClick={startCpuRoll}
        className={`mt-4 px-6 py-2 rounded ${
          playerChoices.length === 2
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-500"
        }`}
      >
        ✅ Confirm Colors
      </button>

      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold mb-2">🎰 CPU Choosing:</h2>
        <div className="text-3xl space-x-4">
          {cpuChoices.slice(0, 2).map((color, idx) => (
            <span key={idx}>{colorData[color]?.emoji || "❓"}</span>
          ))}
        </div>
      </div>

      {ready && (
        <button
          onClick={onStart}
          className="mt-6 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700"
        >
          ▶️ Start Game
        </button>
      )}
    </div>
  );
}
