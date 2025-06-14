// src/context/GameProvider.jsx

import { useState, useEffect, useRef } from "react";
import GameContext from "./GameContext";
import {
  redDeck,
  greenDeck,
  blueDeck,
  whiteDeck,
  blackDeck,
} from "../data/cards";
import { createDualColorDeck } from "../data/deckbuilder";
import { playCard, startTurn, declareAttacker, resolveCombat } from "./PlayerActions";
import { runOpponentTurn } from "./OpponentAI/index.js";
import { getStateForActions } from "./getStateForActions";

// 🎯 Default placeholder decks
const playerDeckChoice = createDualColorDeck(blueDeck, whiteDeck);
const opponentDeckChoice = createDualColorDeck(redDeck, greenDeck);

export default function GameProvider({ children }) {
  const playerDeckRef = useRef([...playerDeckChoice]);
  const opponentDeckRef = useRef([...opponentDeckChoice]);

  const playerDeck = playerDeckRef.current;
  const opponentDeck = opponentDeckRef.current;

  const initialHand = playerDeck.slice(0, 7);
  const initialLibrary = playerDeck.slice(7);
  const initialOpponentHand = opponentDeck.slice(0, 7);
  const initialOpponentLibrary = opponentDeck.slice(7);

  const [hand, setHand] = useState(initialHand);
  const [library, setLibrary] = useState(initialLibrary);
  const [graveyard, setGraveyard] = useState([]);
  const [playerBattlefield, setPlayerBattlefield] = useState([]);
  const [opponentBattlefield, setOpponentBattlefield] = useState([]);

  const [playerLife, setPlayerLifeState] = useState(20);
  const [opponentLife, setOpponentLifeState] = useState(20);
  const playerLifeRef = useRef(playerLife);
  const opponentLifeRef = useRef(opponentLife);

  useEffect(() => { playerLifeRef.current = playerLife; }, [playerLife]);
  useEffect(() => { opponentLifeRef.current = opponentLife; }, [opponentLife]);

  const [manaPool, setManaPool] = useState({
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  });

  const [playerColors, setPlayerColors] = useState(["blue", "white"]);

  const [playedLand, setPlayedLand] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [turnCount, setTurnCount] = useState(1);

  const [opponentHand, setOpponentHand] = useState(initialOpponentHand);
  const [opponentLibrary, setOpponentLibrary] = useState(initialOpponentLibrary);
  const [opponentMana, setOpponentMana] = useState({
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  });
  const [opponentPlayedLand, setOpponentPlayedLand] = useState(false);

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [pendingSpell, setPendingSpell] = useState(null);
  const [blockingPhase, setBlockingPhase] = useState(false);
  const [declaredAttackers, setDeclaredAttackers] = useState([]);
  const [blockAssignments, setBlockAssignments] = useState({});
  const [log, setLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const currentTurn = useRef("player");
  const hasStartedTurn = useRef(false);
  const isRunningCPU = useRef(false);

  useEffect(() => {
    if (currentTurn.current === "player" && turnCount > 1 && !hasStartedTurn.current && !gameOver) {
      hasStartedTurn.current = true;
      startTurn(getStateForActions(contextValues));
    }
  }, [turnCount, gameOver]);

  function handlePlayCard(card) {
    if (!gameOver) playCard(card, getStateForActions(contextValues));
  }

  function handleDeclareAttacker(cardId) {
    if (!gameOver) declareAttacker(cardId, getStateForActions(contextValues));
  }

  function handleResolveCombat() {
    if (!gameOver) resolveCombat(getStateForActions(contextValues));
  }

  function handleEndTurn() {
    if (gameOver) return;
    setLog(prev => [...prev, "➡️ You ended your turn."]);
    currentTurn.current = "opponent";
    setIsPlayerTurn(false);

    setTimeout(() => {
      if (!isRunningCPU.current) {
        isRunningCPU.current = true;

        runOpponentTurn(getStateForActions(contextValues), () => {
          setTimeout(() => {
            setTurnCount(prev => prev + 1);
            currentTurn.current = "player";
            hasStartedTurn.current = false;
            isRunningCPU.current = false;
            setIsPlayerTurn(true);
          }, 300);
        });
      }
    }, 300);
  }

  function restartGame() {
    const newPlayerDeck = createDualColorDeck(blueDeck, whiteDeck);
    const newOpponentDeck = createDualColorDeck(redDeck, greenDeck);

    playerDeckRef.current = newPlayerDeck;
    opponentDeckRef.current = newOpponentDeck;

    setHand(newPlayerDeck.slice(0, 7));
    setLibrary(newPlayerDeck.slice(7));
    setOpponentHand(newOpponentDeck.slice(0, 7));
    setOpponentLibrary(newOpponentDeck.slice(7));

    setPlayerBattlefield([]);
    setOpponentBattlefield([]);
    setGraveyard([]);
    setManaPool({ red: 0, green: 0, blue: 0, white: 0, black: 0 });
    setOpponentMana({ red: 0, green: 0, blue: 0, white: 0, black: 0 });
    setPlayedLand(false);
    setHasDrawnCard(false);
    setIsPlayerTurn(true);
    setTurnCount(1);
    setPlayerLifeState(20);
    setOpponentLifeState(20);
    setOpponentPlayedLand(false);
    setSelectedTarget(null);
    setPendingSpell(null);
    setBlockingPhase(false);
    setDeclaredAttackers([]);
    setBlockAssignments({});
    setLog([]);
    currentTurn.current = "player";
    hasStartedTurn.current = false;
    isRunningCPU.current = false;
    setGameOver(false);
    setGameResult(null);
  }

  function resetGameState() {
    setHand([]);
    setLibrary([]);
    setOpponentHand([]);
    setOpponentLibrary([]);
    setPlayerColors([]);

    setPlayerBattlefield([]);
    setOpponentBattlefield([]);
    setGraveyard([]);
    setManaPool({ red: 0, green: 0, blue: 0, white: 0, black: 0 });
    setOpponentMana({ red: 0, green: 0, blue: 0, white: 0, black: 0 });

    setPlayedLand(false);
    setHasDrawnCard(false);
    setSelectedTarget(null);
    setPendingSpell(null);
    setBlockingPhase(false);
    setDeclaredAttackers([]);
    setBlockAssignments({});
    setLog([]);
    setGameOver(false);
    setGameResult(null);

    setPlayerLifeState(20);
    setOpponentLifeState(20);

    setTurnCount(1);
    setIsPlayerTurn(true);
    currentTurn.current = "player";
    hasStartedTurn.current = false;
    isRunningCPU.current = false;
  }

  const contextValues = {
    hand,
    setHand,
    setPlayerBattlefield,
    setOpponentBattlefield,
    setGraveyard,
    manaPool,
    setManaPool,
    playedLand,
    setPlayedLand,
    setLog,
    setOpponentLife: (valOrFn) => {
      setOpponentLifeState(prev => {
        const safePrev = typeof prev === "number" ? prev : 20;
        const next = typeof valOrFn === "function" ? valOrFn(safePrev) : valOrFn;
        opponentLifeRef.current = next;
        setTimeout(() => {
          if (next <= 0) {
            setLog(prev => [...prev, "🏆 You win! Game over."]);
            setGameOver(true);
            setGameResult("win");
          }
        }, 0);
        return next;
      });
    },
    setPlayerLife: (valOrFn) => {
      setPlayerLifeState(prev => {
        const safePrev = typeof prev === "number" ? prev : 20;
        const next = typeof valOrFn === "function" ? valOrFn(safePrev) : valOrFn;
        playerLifeRef.current = next;
        setTimeout(() => {
          if (next <= 0) {
            setLog(prev => [...prev, "💀 You lose! Game over."]);
            setGameOver(true);
            setGameResult("loss");
          }
        }, 0);
        return next;
      });
    },
    playerLife,
    opponentLife,
    isPlayerTurn,
    playerBattlefield,
    opponentBattlefield,
    setOpponentHand,
    setOpponentMana,
    setOpponentPlayedLand,
    opponentHand,
    opponentPlayedLand,
    setLibrary,
    setHasDrawnCard,
    library,
    currentTurn,
    setTurnCount,
    setIsPlayerTurn,
    hasStartedTurn,
    isRunningCPU,
    selectedTarget,
    setSelectedTarget,
    pendingSpell,
    setPendingSpell,
    blockingPhase,
    setBlockingPhase,
    declaredAttackers,
    setDeclaredAttackers,
    blockAssignments,
    setBlockAssignments,
    opponentLibrary,
    setOpponentLibrary,
    setGameOver,
    setGameResult,
    log,
    opponentMana,
    playCard: handlePlayCard,
    declareAttacker: handleDeclareAttacker,
    resolveCombat: handleResolveCombat,
    endTurn: handleEndTurn,
    gameOver,
    gameResult,
    restartGame,
    playerColors,
    setPlayerColors,
    resetGameState,
  };

  return (
    <GameContext.Provider value={contextValues}>
      {children}
    </GameContext.Provider>
  );
}
