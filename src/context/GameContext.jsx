// src/context/GameContext.jsx

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { sampleDeck } from "../data/cards";
import { playCard, startTurn, declareAttacker, resolveCombat } from "./PlayerActions";
import { runOpponentTurn } from "./OpponentAI";

const GameContext = createContext();

export function GameProvider({ children }) {
  const shuffledDeck = [...sampleDeck].sort(() => 0.5 - Math.random());
  const initialHand = shuffledDeck.slice(0, 7);
  const initialLibrary = shuffledDeck.slice(7);

  const opponentDeck = [...sampleDeck].sort(() => 0.5 - Math.random());
  const initialOpponentHand = opponentDeck.slice(0, 7);
  const initialOpponentLibrary = opponentDeck.slice(7);

  const [hand, setHand] = useState(initialHand);
  const [library, setLibrary] = useState(initialLibrary);
  const [graveyard, setGraveyard] = useState([]);

  const [playerBattlefield, setPlayerBattlefield] = useState([]);
  const [opponentBattlefield, setOpponentBattlefield] = useState([]);

  const [playerLife, setPlayerLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);

  const [manaPool, setManaPool] = useState(0);
  const [playedLand, setPlayedLand] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [turnCount, setTurnCount] = useState(1);

  const [opponentHand, setOpponentHand] = useState(initialOpponentHand);
  const [opponentLibrary, setOpponentLibrary] = useState(initialOpponentLibrary);
  const [opponentMana, setOpponentMana] = useState(0);
  const [opponentPlayedLand, setOpponentPlayedLand] = useState(false);

  const [selectedTarget, setSelectedTarget] = useState(null);

  // ✅ Blocking system state
  const [blockingPhase, setBlockingPhase] = useState(false);
  const [declaredAttackers, setDeclaredAttackers] = useState([]);
  const [blockAssignments, setBlockAssignments] = useState({});

  const [log, setLog] = useState([]);
  function logMessage(msg) {
    setLog(prev => [...prev, msg]);
  }

  const currentTurn = useRef("player");
  const hasStartedTurn = useRef(false);
  const isRunningCPU = useRef(false);

  useEffect(() => {
    if (currentTurn.current === "player" && turnCount > 1 && !hasStartedTurn.current) {
      hasStartedTurn.current = true;
      startTurn(getStateForActions());
    }
  }, [turnCount]);

  function getStateForActions() {
    return {
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
      setOpponentLife,
      isPlayerTurn,
      playerBattlefield,
      opponentBattlefield,
      setOpponentHand,
      setOpponentMana,
      setPlayerLife,
      setOpponentPlayedLand,
      opponentHand,
      opponentPlayedLand,
      setGraveyard,
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
      blockingPhase,
      setBlockingPhase,
      declaredAttackers,
      setDeclaredAttackers,
      blockAssignments,
      setBlockAssignments,
    };
  }

  function handlePlayCard(card) {
    playCard(card, getStateForActions());
  }

  function handleDeclareAttacker(cardId) {
    declareAttacker(cardId, getStateForActions());
  }

  function handleResolveCombat() {
    resolveCombat(getStateForActions());
  }

  function handleEndTurn() {
    currentTurn.current = "opponent";
    setIsPlayerTurn(false);

    setTimeout(() => {
      if (!isRunningCPU.current) {
        isRunningCPU.current = true;
        runOpponentTurn(getStateForActions());
      }
    }, 300);
  }

  return (
    <GameContext.Provider
      value={{
        hand,
        library,
        graveyard,
        playerBattlefield,
        opponentBattlefield,
        playerLife,
        opponentLife,
        manaPool,
        playedLand,
        isPlayerTurn,
        playCard: handlePlayCard,
        endTurn: handleEndTurn,
        declareAttacker: handleDeclareAttacker,
        resolveCombat: handleResolveCombat,
        setPlayerBattlefield,
        setManaPool,
        log,
        opponentHand,
        opponentLibrary,
        opponentMana,
        selectedTarget,
        setSelectedTarget,
        blockingPhase,
        setBlockingPhase,
        declaredAttackers,
        setDeclaredAttackers,
        blockAssignments,
        setBlockAssignments,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
