// src/context/OpponentAI.js

export function runOpponentTurn(state) {
  const {
    opponentBattlefield,
    setOpponentBattlefield,
    setOpponentPlayedLand,
    setLog,
  } = state;

  setLog(prev => [...prev, `🤖 Opponent's turn begins.`]);
  setOpponentPlayedLand(false); // reset land play flag

  // ✅ Untap all lands/creatures first
  const untappedBattlefield = opponentBattlefield.map(c =>
    c.type === "land" || c.type === "creature" ? { ...c, tapped: false } : c
  );

  setOpponentBattlefield(untappedBattlefield);

  // ✅ Delay before starting actual decisions
  setTimeout(() => {
    runOpponentTurnStep1({ ...state, opponentBattlefield: untappedBattlefield });
  }, 500);
}

function runOpponentTurnStep1(state) {
  const {
    opponentBattlefield,
    opponentHand,
    opponentPlayedLand,
    setOpponentBattlefield,
    setOpponentHand,
    setOpponentPlayedLand,
    setLog,
  } = state;

  const battlefield = [...opponentBattlefield];
  const hand = [...opponentHand];

  // ✅ Play a land if available
  const land = hand.find(c => c.type === "land");
  if (land && !opponentPlayedLand) {
    battlefield.push({ ...land, tapped: false });
    setOpponentHand(prev => prev.filter(c => c.id !== land.id));
    setOpponentPlayedLand(true);
    setLog(prev => [...prev, `⛰️ Opponent plays a land.`]);
  }

  setOpponentBattlefield(battlefield);

  // ✅ Delay before moving to tapping + spells
  setTimeout(() => {
    runOpponentTurnStep2({ ...state, opponentBattlefield: battlefield });
  }, 500);
}

function runOpponentTurnStep2(state) {
  const {
    opponentBattlefield,
    opponentHand,
    setOpponentBattlefield,
    setOpponentHand,
    setOpponentMana,
    setGraveyard,
    setLog,
    setPlayerLife,
    playerBattlefield,
    setTurnCount,
    setIsPlayerTurn,
    currentTurn,
    hasStartedTurn,
    isRunningCPU,
    setBlockingPhase,
    setDeclaredAttackers,
  } = state;

  let battlefield = [...opponentBattlefield];
  let hand = [...opponentHand];
  const availableLands = battlefield.filter(c => c.type === "land" && !c.tapped);
  const playableCards = hand
    .filter(c => c.type === "creature" || c.type === "spell")
    .sort((a, b) => (a.type === "creature" ? -1 : 1));

  let manaNeeded = 0;
  const chosenCards = [];

  for (const card of playableCards) {
    if (manaNeeded + card.manaCost <= availableLands.length) {
      manaNeeded += card.manaCost;
      chosenCards.push(card);
    }
  }

  // ✅ Tap required number of lands
  let manaGenerated = 0;
  for (const land of battlefield) {
    if (land.type === "land" && !land.tapped && manaGenerated < manaNeeded) {
      land.tapped = true;
      manaGenerated++;
    }
  }

  setOpponentMana(manaGenerated);
  setLog(prev => [...prev, `🔥 Opponent taps ${manaGenerated} land${manaGenerated !== 1 ? "s" : ""} for mana.`]);

  const newBattlefield = [...battlefield];
  const newGraveyard = [];
  const newLog = [];
  const newHand = [];

  let remainingMana = manaGenerated;

  for (const card of hand) {
    if (chosenCards.includes(card) && remainingMana >= card.manaCost) {
      remainingMana -= card.manaCost;

      if (card.type === "creature") {
        newBattlefield.push({
          ...card,
          tapped: false,
          blocking: null,
          damageTaken: 0,
        });
        newLog.push(`👺 Opponent summons ${card.name} (${card.attack}/${card.defense}).`);
        if (card.special) newLog.push(`✨ ${card.name} — ${card.special}`);
      } else if (card.type === "spell") {
        setPlayerLife(prev => Math.max(0, prev - card.damage ?? 3));
        newGraveyard.push(card);
        newLog.push(`⚡ Opponent casts ${card.name} for ${card.damage ?? 3} damage!`);
      }
    } else {
      newHand.push(card);
    }
  }

  setOpponentHand(newHand);
  setOpponentBattlefield(newBattlefield);
  setGraveyard(prev => [...prev, ...newGraveyard]);
  newLog.forEach(msg => setLog(prev => [...prev, msg]));

  // ✅ Check for attackers
  const attackers = newBattlefield.filter(c => c.type === "creature" && !c.tapped);
  const defenders = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);

  if (attackers.length > 0 && defenders.length > 0) {
    attackers.forEach(c => (c.tapped = true));
    setOpponentBattlefield([...newBattlefield]);
    setDeclaredAttackers(attackers.map(c => c.id));
    setBlockingPhase(true);
    setLog(prev => [...prev, `🛡️ Awaiting player to assign blockers.`]);
    return;
  }

  // ✅ No blockers: deal direct damage
  attackers.forEach(card => {
    setPlayerLife(prev => Math.max(0, prev - card.attack));
    setLog(prev => [...prev, `💥 ${card.name} attacks you for ${card.attack} damage.`]);
    card.tapped = true;
  });

  setOpponentBattlefield([...newBattlefield]);

  currentTurn.current = "player";
  setTimeout(() => {
    setTurnCount(prev => prev + 1);
    setIsPlayerTurn(true);
    hasStartedTurn.current = false;
    isRunningCPU.current = false;
  }, 300);
}
