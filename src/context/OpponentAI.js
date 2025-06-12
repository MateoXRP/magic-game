// src/context/OpponentAI.js

export function runOpponentTurn(state) {
  const {
    opponentBattlefield,
    opponentHand,
    opponentPlayedLand,
    setOpponentBattlefield,
    setOpponentHand,
    setOpponentPlayedLand,
    setOpponentMana,
    setPlayerLife,
    setGraveyard,
    setLog,
    playerBattlefield,
    setTurnCount,
    setIsPlayerTurn,
    currentTurn,
    hasStartedTurn,
    isRunningCPU,
  } = state;

  setLog(prev => [...prev, `🤖 Opponent's turn begins.`]);
  setOpponentPlayedLand(false); // ✅ Fix: allow CPU to play one land per turn

  let newBattlefield = [...opponentBattlefield].map(c =>
    c.type === "land" || c.type === "creature" ? { ...c, tapped: false } : c
  );

  const land = opponentHand.find(c => c.type === "land");
  if (land && !opponentPlayedLand) {
    newBattlefield.push({ ...land, tapped: false });
    setOpponentHand(prev => prev.filter(c => c.id !== land.id));
    setOpponentPlayedLand(true);
    setLog(prev => [...prev, `⛰️ Opponent plays a land.`]);
  }

  const playableCards = [...opponentHand]
    .filter(c => c.type === "creature" || c.type === "spell")
    .sort((a, b) => (a.type === "creature" ? -1 : 1));

  let manaNeeded = 0;
  const availableLands = newBattlefield.filter(c => c.type === "land" && !c.tapped);
  const chosenCards = [];

  for (const card of playableCards) {
    if (manaNeeded + card.manaCost <= availableLands.length) {
      manaNeeded += card.manaCost;
      chosenCards.push(card);
    }
  }

  let manaGenerated = 0;
  for (const card of newBattlefield) {
    if (card.type === "land" && !card.tapped && manaGenerated < manaNeeded) {
      card.tapped = true;
      manaGenerated++;
    }
  }

  setOpponentMana(manaGenerated);
  setLog(prev => [
    ...prev,
    `🔥 Opponent taps ${manaGenerated} land${manaGenerated !== 1 ? 's' : ''} for mana.`,
  ]);

  const newGraveyard = [];
  const newLog = [];
  let mana = manaGenerated;
  const updatedHand = [];

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
      updatedHand.push(card);
    }
  }

  setOpponentMana(mana);
  setOpponentHand(updatedHand);
  setGraveyard(prev => [...prev, ...newGraveyard]);
  setOpponentBattlefield(newBattlefield);
  newLog.forEach(msg => setLog(prev => [...prev, msg]));

  const untappedDefenders = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);
  if (untappedDefenders.length === 0) {
    const attackers = newBattlefield.filter(c => c.type === "creature" && !c.tapped);
    attackers.forEach(card => {
      setPlayerLife(prev => Math.max(0, prev - card.attack));
      setLog(prev => [...prev, `💥 ${card.name} attacks you for ${card.attack} damage.`]);
      card.tapped = true;
    });
    setOpponentBattlefield([...newBattlefield]);
  } else {
    setLog(prev => [...prev, `🛡️ Opponent holds back due to your defenders.`]);
  }

  currentTurn.current = "player";
  setTimeout(() => {
    setTurnCount(prev => prev + 1);
    setIsPlayerTurn(true);
    hasStartedTurn.current = false;
    isRunningCPU.current = false;
  }, 300);
}
