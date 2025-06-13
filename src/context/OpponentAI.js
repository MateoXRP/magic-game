// src/context/OpponentAI.js

export function runOpponentTurn(state) {
  const {
    opponentBattlefield,
    setOpponentBattlefield,
    setOpponentPlayedLand,
    setLog,
  } = state;

  setLog(prev => [...prev, `🤖 Opponent's turn begins.`]);
  setOpponentPlayedLand(false);

  const untappedBattlefield = opponentBattlefield.map(c =>
    c.type === "land" || c.type === "creature" ? { ...c, tapped: false } : c
  );

  setOpponentBattlefield(untappedBattlefield);

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
    setPlayerBattlefield,
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

  const colorCounts = availableLands.reduce((acc, land) => {
    acc[land.color] = (acc[land.color] || 0) + 1;
    return acc;
  }, {});

  let usedColorCount = {};
  let manaNeeded = 0;
  const chosenCards = [];

  const hasOpponentCreatures = playerBattlefield.some(c => c.type === "creature");
  const hasOpponentLands = playerBattlefield.some(c => c.type === "land");
  const hasOwnCreatures = battlefield.some(c => c.type === "creature");

  function isValidSpell(card) {
    if (!card.targetType) {
      if (card.name === "Pestilence") return hasOpponentCreatures;
      return true;
    }
    if (card.name === "Giant Growth") return hasOwnCreatures;
    if (card.name === "Tsunami") return hasOpponentLands;
    return true;
  }

  const playableCards = hand
    .filter(c => (c.type === "creature" || c.type === "spell") && isValidSpell(c))
    .sort((a, b) => (a.type === "creature" ? -1 : 1));

  for (const card of playableCards) {
    const color = card.color;
    const colorAvailable = (colorCounts[color] || 0) - (usedColorCount[color] || 0);
    if (colorAvailable >= 1 && manaNeeded + card.manaCost <= availableLands.length) {
      usedColorCount[color] = (usedColorCount[color] || 0) + 1;
      manaNeeded += card.manaCost;
      chosenCards.push(card);
    }
  }

  let manaGenerated = 0;
  for (const land of battlefield) {
    if (!land.tapped && manaGenerated < manaNeeded) {
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
    if (!chosenCards.includes(card) || remainingMana < card.manaCost) {
      newHand.push(card);
      continue;
    }

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
      if (card.name === "Pestilence") {
        const creatureCount = playerBattlefield.filter(c => c.type === "creature").length;
        setPlayerLife(prev => Math.max(0, prev - creatureCount));
        newGraveyard.push(card);
        newLog.push(`☠️ ${card.name} deals ${creatureCount} damage to you.`);
      } else if (card.name === "Tsunami") {
        const lands = playerBattlefield.filter(c => c.type === "land");
        if (lands.length > 0) {
          const grouped = lands.reduce((acc, land) => {
            acc[land.name] = (acc[land.name] || 0) + 1;
            return acc;
          }, {});
          const rarestLand = Object.entries(grouped).sort((a, b) => a[1] - b[1])[0][0];
          const target = lands.find(c => c.name === rarestLand);
          if (target) {
            setLog(prev => [...prev, `🌊 ${card.name} destroys your ${target.name}.`]);
            setPlayerBattlefield(prev => prev.filter(c => c.id !== target.id));
            newGraveyard.push(card);
          }
        }
      } else if (card.name === "Lightning Bolt") {
        const targets = playerBattlefield.filter(c => c.type === "creature");
        if (targets.length > 0) {
          const target = targets[0];
          setPlayerBattlefield(prev => prev.filter(c => c.id !== target.id));
          newGraveyard.push(card);
          newLog.push(`🔥 ${card.name} destroys your ${target.name}.`);
        } else {
          setPlayerLife(prev => Math.max(0, prev - (card.damage ?? 3)));
          newGraveyard.push(card);
          newLog.push(`⚡ ${card.name} hits you for ${card.damage ?? 3} damage!`);
        }
      } else {
        setPlayerLife(prev => Math.max(0, prev - (card.damage ?? 3)));
        newGraveyard.push(card);
        newLog.push(`⚡ ${card.name} hits you for ${card.damage ?? 3} damage!`);
      }
    }
  }

  setOpponentHand(newHand);
  setOpponentBattlefield(newBattlefield);
  setGraveyard(prev => [...prev, ...newGraveyard]);
  newLog.forEach(msg => setLog(prev => [...prev, msg]));

  // ✅ SMART ATTACK LOGIC
  const untappedAttackers = newBattlefield.filter(c => c.type === "creature" && !c.tapped);
  const untappedDefenders = playerBattlefield.filter(c => c.type === "creature" && !c.tapped);

  let chosenAttackers = [];

  if (untappedDefenders.length === 0) {
    // No blockers — swing with everything
    chosenAttackers = [...untappedAttackers];
  } else {
    // Only attack with creatures that can't be killed if blocked
    chosenAttackers = untappedAttackers.filter(attacker =>
      !untappedDefenders.some(defender => defender.attack >= attacker.defense)
    );
  }

  if (chosenAttackers.length > 0) {
    chosenAttackers.forEach(c => (c.tapped = true));
    setOpponentBattlefield([...newBattlefield]);
    setDeclaredAttackers(chosenAttackers.map(c => c.id));
    setBlockingPhase(true);
    setLog(prev => [...prev, `🛡️ Awaiting player to assign blockers.`]);
    return;
  }

  // No attacks — pass turn
  setOpponentBattlefield([...newBattlefield]);

  currentTurn.current = "player";
  setTimeout(() => {
    setTurnCount(prev => prev + 1);
    setIsPlayerTurn(true);
    hasStartedTurn.current = false;
    isRunningCPU.current = false;
  }, 300);
}
