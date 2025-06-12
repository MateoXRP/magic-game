import { createContext, useContext, useState, useEffect } from "react";
import { sampleDeck } from "../data/cards";

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

  const [log, setLog] = useState([]);
  function logMessage(msg) {
    setLog(prev => [...prev, msg]);
  }

  useEffect(() => {
    if (isPlayerTurn && turnCount > 1) {
      startTurn();
    }
  }, [isPlayerTurn]);

  function playCard(card) {
    if (!isPlayerTurn) return;

    const isInHand = hand.find(c => c.id === card.id);
    if (!isInHand) return;

    if (card.type === "land") {
      if (playedLand) return;
      setPlayedLand(true);
      setPlayerBattlefield(prev => [...prev, { ...card, tapped: false }]);
      setHand(prev => prev.filter(c => c.id !== card.id));
      logMessage(`🪨 Played ${card.name}.`);
      return;
    }

    if (card.type === "creature" || card.type === "spell") {
      if (manaPool < card.manaCost) {
        return alert("Not enough mana!");
      }

      setManaPool(prev => prev - card.manaCost);
      setHand(prev => prev.filter(c => c.id !== card.id));

      if (card.type === "creature") {
        setPlayerBattlefield(prev => [
          ...prev,
          {
            ...card,
            tapped: false,
            attacking: false,
            blocking: null,
            damageTaken: 0,
          },
        ]);
        logMessage(`🧙 Summoned ${card.name} (${card.attack}/${card.defense}).`);
      } else if (card.type === "spell") {
        setGraveyard(prev => [...prev, card]);
        setOpponentLife(hp => hp - 3);
        logMessage(`💥 Lightning Bolt deals 3 damage to opponent.`);
      }
    }
  }

  function startTurn() {
    if (manaPool > 0) {
      setPlayerLife(prev => Math.max(0, prev - manaPool));
      logMessage(`🔥 You took ${manaPool} mana burn damage!`);
    }

    setManaPool(0);

    setPlayerBattlefield(prev =>
      prev.map(c =>
        c.type === "land" || c.type === "creature"
          ? { ...c, tapped: false, attacking: false, blocking: null, damageTaken: 0 }
          : c
      )
    );
    setPlayedLand(false);
    setHasDrawnCard(false);

    if (library.length > 0) {
      setHand(prev => [...prev, library[0]]);
      setLibrary(prev => prev.slice(1));
      setHasDrawnCard(true);
      logMessage(`📥 Drew a card.`);
    }
  }

  function endTurn() {
    setIsPlayerTurn(false);
    setTimeout(() => {
      runOpponentTurn();
      setTurnCount(prev => prev + 1);
      setIsPlayerTurn(true);
    }, 1000);
  }

  function runOpponentTurn() {
    logMessage(`🤖 Opponent's turn begins.`);

    setOpponentBattlefield(prev =>
      prev.map(c =>
        c.type === "land" || c.type === "creature"
          ? { ...c, tapped: false }
          : c
      )
    );

    setOpponentMana(0);
    setOpponentPlayedLand(false);

    if (turnCount > 1 && opponentLibrary.length > 0) {
      setOpponentHand(prev => [...prev, opponentLibrary[0]]);
      setOpponentLibrary(prev => prev.slice(1));
      logMessage(`📥 Opponent draws a card.`);
    }

    const land = opponentHand.find(c => c.type === "land");
    if (land && !opponentPlayedLand) {
      setOpponentBattlefield(prev => [...prev, { ...land, tapped: false }]);
      setOpponentHand(prev => prev.filter(c => c.id !== land.id));
      setOpponentPlayedLand(true);
      logMessage(`⛰️ Opponent plays a land.`);
    }

    const playableCards = [...opponentHand]
      .filter(c => c.type === "creature" || c.type === "spell")
      .sort((a, b) => (a.type === "creature" ? -1 : 1));

    let manaNeeded = 0;
    let chosenCards = [];
    const availableLands = opponentBattlefield.filter(c => c.type === "land" && !c.tapped);

    for (const card of playableCards) {
      if (manaNeeded + card.manaCost <= availableLands.length) {
        manaNeeded += card.manaCost;
        chosenCards.push(card);
      }
    }

    setOpponentBattlefield(prev => {
      const updated = [...prev];
      let manaGenerated = 0;
      for (const card of updated) {
        if (manaGenerated >= manaNeeded) break;
        if (card.type === "land" && !card.tapped) {
          card.tapped = true;
          manaGenerated++;
        }
      }
      setOpponentMana(manaGenerated);
      logMessage(`🔥 Opponent taps ${manaGenerated} land${manaGenerated !== 1 ? "s" : ""} for mana.`);
      return updated;
    });

    // Cast chosen cards (corrected logic)
    setOpponentBattlefield(prevBattlefield => {
      const newBattlefield = [...prevBattlefield];
      const newGraveyard = [];
      const newLog = [];
      let mana = manaNeeded;
      const newHand = [];

      for (const card of opponentHand) {
        if (chosenCards.includes(card) && mana >= card.manaCost) {
          mana -= card.manaCost;

          if (card.type === "creature") {
            newBattlefield.push({
              ...card,
              tapped: false,
              blocking: null,
              damageTaken: 0,
            });
            newLog.push(`👺 Opponent summons ${card.name} (${card.attack}/${card.defense}).`);
          } else if (card.type === "spell") {
            setPlayerLife(prev => Math.max(0, prev - 3));
            newGraveyard.push(card);
            newLog.push(`⚡ Opponent casts ${card.name} for 3 damage!`);
          }
        } else {
          newHand.push(card);
        }
      }

      setOpponentMana(mana);
      setOpponentHand(newHand);
      setGraveyard(prev => [...prev, ...newGraveyard]);
      newLog.forEach(msg => logMessage(msg));
      return newBattlefield;
    });

    // Attack only if no untapped defenders
    const untappedDefenders = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);
    if (untappedDefenders.length === 0) {
      setOpponentBattlefield(prev =>
        prev.map(card => {
          if (card.type === "creature" && !card.tapped) {
            setPlayerLife(hp => Math.max(0, hp - card.attack));
            logMessage(`💥 ${card.name} attacks you for ${card.attack} damage.`);
            return { ...card, tapped: true };
          }
          return card;
        })
      );
    } else {
      logMessage(`🛡️ Opponent holds back due to your defenders.`);
    }
  }

  function declareAttacker(cardId) {
    if (!isPlayerTurn) return;

    setPlayerBattlefield(prev =>
      prev.map(card => {
        if (card.id !== cardId || card.type !== "creature") return card;
        if (card.tapped && !card.attacking) {
          logMessage(`🚫 ${card.name} is tapped and cannot attack.`);
          return card;
        }
        if (card.attacking) {
          logMessage(`↩️ ${card.name} attack canceled.`);
          return { ...card, attacking: false, tapped: false };
        }
        logMessage(`⚔️ ${card.name} declared as attacker.`);
        return { ...card, attacking: true, tapped: true };
      })
    );
  }

  function resolveCombat() {
    const updatedPlayer = [...playerBattlefield];
    const updatedOpponent = [...opponentBattlefield];

    const attackers = updatedPlayer.filter(c => c.attacking);
    const blockers = updatedOpponent.filter(c => c.type === "creature" && !c.tapped);
    const grave = [];

    attackers.forEach(attacker => {
      const blocker = blockers.shift();
      if (blocker) {
        attacker.damageTaken = blocker.attack;
        blocker.damageTaken = attacker.attack;
        blocker.tapped = true;
        blocker.blocking = attacker.id;

        if (attacker.damageTaken >= attacker.defense) grave.push(attacker);
        if (blocker.damageTaken >= blocker.defense) grave.push(blocker);

        logMessage(`🛡️ ${blocker.name} blocked ${attacker.name}.`);
      } else {
        setOpponentLife(hp => Math.max(0, hp - attacker.attack));
        logMessage(`💥 ${attacker.name} hits opponent for ${attacker.attack} damage.`);
      }
    });

    const remainingPlayer = updatedPlayer.filter(c => !grave.includes(c));
    const remainingOpponent = updatedOpponent.filter(c => !grave.includes(c));

    setPlayerBattlefield(
      remainingPlayer.map(c => ({
        ...c,
        attacking: false,
        tapped: c.tapped || c.attacking,
      }))
    );
    setOpponentBattlefield(
      remainingOpponent.map(c => ({ ...c, blocking: null }))
    );
    setGraveyard(prev => [...prev, ...grave]);
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
        playCard,
        endTurn,
        declareAttacker,
        resolveCombat,
        setPlayerBattlefield,
        setManaPool,
        log,
        opponentHand,
        opponentLibrary,
        opponentMana,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
