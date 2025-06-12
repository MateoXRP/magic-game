import { createContext, useContext, useState, useEffect } from "react";
import { sampleDeck } from "../data/cards";

const GameContext = createContext();

export function GameProvider({ children }) {
  const shuffledDeck = [...sampleDeck].sort(() => 0.5 - Math.random());

  const [library, setLibrary] = useState(shuffledDeck);
  const [hand, setHand] = useState(shuffledDeck.slice(0, 7));
  const [graveyard, setGraveyard] = useState([]);

  const [playerBattlefield, setPlayerBattlefield] = useState([]);
  const [opponentBattlefield, setOpponentBattlefield] = useState([]);

  const [playerLife, setPlayerLife] = useState(20);
  const [opponentLife, setOpponentLife] = useState(20);

  const [manaPool, setManaPool] = useState(0);
  const [playedLand, setPlayedLand] = useState(false);
  const [hasDrawnCard, setHasDrawnCard] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  useEffect(() => {
    setPlayedLand(false);
    setHasDrawnCard(false);
  }, []);

  function drawCard() {
    if (!isPlayerTurn) return;
    if (hasDrawnCard) {
      alert("You’ve already drawn a card this turn.");
      return;
    }
    if (library.length === 0) return;
    setHand([...hand, library[0]]);
    setLibrary(library.slice(1));
    setHasDrawnCard(true);
  }

  function playCard(card) {
    if (!isPlayerTurn) return;

    const isInHand = hand.find(c => c.id === card.id);
    if (!isInHand) return;

    if (card.type === "land") {
      if (playedLand) {
        alert("You already played a land this turn.");
        return;
      }

      setPlayerBattlefield([...playerBattlefield, { ...card, tapped: false }]);
      setHand(hand.filter(c => c.id !== card.id));
      setPlayedLand(true);
      return;
    }

    if (card.type === "creature" || card.type === "spell") {
      if (manaPool < card.manaCost) {
        return alert("Not enough mana!");
      }

      setManaPool(prev => prev - card.manaCost);
      setHand(hand.filter(c => c.id !== card.id));

      if (card.type === "creature") {
        setPlayerBattlefield([
          ...playerBattlefield,
          {
            ...card,
            tapped: false,
            attacking: false,
            blocking: null,
            damageTaken: 0,
          },
        ]);
      } else if (card.type === "spell") {
        alert("💥 Lightning Bolt for 3 damage!");
        setGraveyard([...graveyard, card]);
        setOpponentLife(hp => hp - 3);
      }
    }
  }

  function startTurn() {
    if (!isPlayerTurn) return;

    setPlayerBattlefield(prev =>
      prev.map(c =>
        c.type === "land" || c.type === "creature"
          ? { ...c, tapped: false, attacking: false, blocking: null, damageTaken: 0 }
          : c
      )
    );
    setPlayedLand(false);
    setHasDrawnCard(false);
  }

  function endTurn() {
    setIsPlayerTurn(false);

    setTimeout(() => {
      setOpponentBattlefield(prev =>
        prev.map(c =>
          c.type === "land" || c.type === "creature"
            ? { ...c, tapped: false, attacking: false, blocking: null }
            : c
        )
      );
      setIsPlayerTurn(true);
      startTurn(); // ✅ Auto-untap next turn
    }, 1000);
  }

  function declareAttacker(cardId) {
    if (!isPlayerTurn) return;

    setPlayerBattlefield(prev =>
      prev.map(card => {
        if (
          card.id === cardId &&
          card.type === "creature" &&
          !card.tapped
        ) {
          return { ...card, attacking: true, tapped: true };
        }
        return card;
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

        if (attacker.damageTaken >= attacker.defense) {
          grave.push(attacker);
        }
        if (blocker.damageTaken >= blocker.defense) {
          grave.push(blocker);
        }
      } else {
        setOpponentLife(hp => Math.max(0, hp - attacker.attack));
      }
    });

    const remainingPlayer = updatedPlayer.filter(c => !grave.includes(c));
    const remainingOpponent = updatedOpponent.filter(c => !grave.includes(c));

    setPlayerBattlefield(remainingPlayer.map(c => ({ ...c, attacking: false })));
    setOpponentBattlefield(remainingOpponent.map(c => ({ ...c, blocking: null })));
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
        drawCard,
        playCard,
        startTurn,
        endTurn,
        declareAttacker,
        resolveCombat,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
