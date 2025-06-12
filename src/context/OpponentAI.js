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

  // ✅ Untap all lands/creatures and remove temporary buffs
  const untappedBattlefield = opponentBattlefield.map(c => {
    if (c.type === "creature" && c.boosted) {
      return {
        ...c,
        attack: c.attack - 3,
        defense: c.defense - 3,
        tapped: false,
        boosted: false,
      };
    }

    if (c.type === "land" || c.type === "creature") {
      return { ...c, tapped: false };
    }

    return c;
  });

  setOpponentBattlefield(untappedBattlefield);

  // ✅ Delay before starting actual decisions
  setTimeout(() => {
    runOpponentTurnStep1({
      ...state,
      opponentBattlefield: untappedBattlefield,
      opponentPlayedLand: false,
    });
  }, 500);
}

function runOpponentTurnStep1(state) {
  const {
    opponentBattlefield,
    opponentHand,
    opponentLibrary,
    opponentPlayedLand,
    setOpponentBattlefield,
    setOpponentHand,
    setOpponentLibrary,
    setOpponentPlayedLand,
    setLog,
  } = state;

  const battlefield = [...opponentBattlefield];
  let hand = [...opponentHand];

  if (opponentLibrary && opponentLibrary.length > 0) {
    const drawnCard = opponentLibrary[0];
    hand.push(drawnCard);
    setOpponentHand(hand);
    setOpponentLibrary(opponentLibrary.slice(1));
    setLog(prev => [
      ...prev,
      `📅 Opponent draws ${drawnCard.name}. Hand now has ${hand.length} card(s).`
    ]);
  } else {
    setLog(prev => [...prev, `❗ Opponent has no cards left to draw.`]);
  }

  const land = hand.find(c => c.type === "land");
  if (land && !opponentPlayedLand) {
    battlefield.push({ ...land, tapped: false });
    hand = hand.filter(c => c.id !== land.id);
    setOpponentHand(hand);
    setOpponentPlayedLand(true);
    setLog(prev => [...prev, `⛰️ Opponent plays ${land.name}.`]);
  } else {
    setLog(prev => [
      ...prev,
      `🛑 No land played. opponentPlayedLand=${opponentPlayedLand}, land found=${!!land}`
    ]);
  }

  setOpponentBattlefield(battlefield);

  setTimeout(() => {
    runOpponentTurnStep2({ ...state, opponentBattlefield: battlefield, opponentHand: hand });
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

  let manaGenerated = 0;
  for (const land of battlefield) {
    if (land.type === "land" && !land.tapped && manaGenerated < manaNeeded) {
      land.tapped = true;
      manaGenerated++;
    }
  }

  setOpponentMana(manaGenerated);
  setLog(prev => [
    ...prev,
    `🔥 Opponent taps ${manaGenerated} land${manaGenerated !== 1 ? "s" : ""} for mana.`
  ]);

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
