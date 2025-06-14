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
  }

  const land = hand.find(c => c.type === "land");
  if (land && !opponentPlayedLand) {
    battlefield.push({ ...land, tapped: false });
    hand = hand.filter(c => c.id !== land.id);
    setOpponentHand(hand);
    setOpponentPlayedLand(true);
    setLog(prev => [...prev, `⛰️ Opponent plays ${land.name}.`]);
  }

  setOpponentBattlefield(battlefield);

  setTimeout(() => {
    runOpponentTurnStep2({
      ...state,
      opponentBattlefield: battlefield,
      opponentHand: hand,
    });
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
    playerLife,
  } = state;

  let battlefield = [...opponentBattlefield];
  let hand = [...opponentHand];
  const availableLands = battlefield.filter(c => c.type === "land" && !c.tapped);

  const colorCounts = availableLands.reduce((acc, land) => {
    acc[land.color] = (acc[land.color] || 0) + 1;
    return acc;
  }, {});

  const hasOpponentCreatures = playerBattlefield.some(c => c.type === "creature");
  const hasOwnCreatures = battlefield.some(c => c.type === "creature");

  function isValidSpell(card) {
    if (!card.targetType) {
      if (card.name === "Pestilence") return hasOpponentCreatures;
      return true;
    }
    if (card.name === "Giant Growth") return hasOwnCreatures;
    if (card.name === "Tsunami") {
      const lands = playerBattlefield.filter(c => c.type === "land");
      return lands.length > 0 && lands.length <= 2;
    }
    return true;
  }

  const playable = hand
    .filter(c => (c.type === "creature" || c.type === "spell") && isValidSpell(c))
    .sort((a, b) => (a.type === "creature" ? -1 : 1));

  const chosenCards = [];
  let usedColorCount = {};
  let manaNeeded = 0;

  for (const card of playable) {
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

  // Giant Growth (before combat)
  const giantGrowth = hand.find(c => c.name === "Giant Growth");
  if (giantGrowth && remainingMana >= giantGrowth.manaCost) {
    const attackers = newBattlefield.filter(c => c.type === "creature" && !c.tapped);
    const blockers = playerBattlefield.filter(c => c.type === "creature");

    let target = null;

    for (const a of attackers) {
      for (const b of blockers) {
        if (a.attack <= b.defense && a.attack + 3 > b.defense) {
          target = a;
          break;
        }
      }
      if (target) break;
    }

    if (!target && attackers.length > 0) {
      target = attackers.reduce((weakest, curr) =>
        curr.attack < weakest.attack ? curr : weakest
      );
    }

    if (target) {
      const updated = newBattlefield.map(c =>
        c.id === target.id
          ? { ...c, attack: c.attack + 3, defense: c.defense + 3, boosted: true }
          : c
      );
      setOpponentBattlefield(updated);
      setGraveyard(prev => [...prev, giantGrowth]);
      setLog(prev => [...prev, `🌿 Giant Growth boosts ${target.name} with +3/3.`]);
      hand = hand.filter(c => c.id !== giantGrowth.id);
      remainingMana -= giantGrowth.manaCost;
    }
  }

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
        const targets = playerBattlefield.filter(c => c.type === "creature");
        const damage = targets.length;
        const playerLifeNow = typeof playerLife === "number" ? playerLife : 20;

        if (damage >= 2 || playerLifeNow - damage <= 0) {
          setPlayerLife(prev => Math.max(0, prev - damage));
          newGraveyard.push(card);
          newLog.push(`☠️ ${card.name} deals ${damage} damage to you.`);
        } else {
          newHand.push(card); // Skip casting
          remainingMana += card.manaCost;
        }
      } else if (card.name === "Tsunami") {
        const lands = playerBattlefield.filter(c => c.type === "land");
        if (lands.length > 0) {
          const target = lands[0];
          setPlayerBattlefield(prev => prev.filter(c => c.id !== target.id));
          newGraveyard.push(card);
          newLog.push(`🌊 Tsunami destroys your ${target.name}.`);
        }
      } else if (card.name === "Lightning Bolt") {
        const targets = playerBattlefield.filter(c => c.type === "creature");
        const priority = ["Goblin Chief", "Knight", "Paladin", "Forest Bear", "Sea Serpent"];

        let target =
          targets.find(c => priority.includes(c.name)) ||
          targets.sort((a, b) => b.attack - a.attack)[0];

        if (target) {
          setPlayerBattlefield(prev => prev.filter(c => c.id !== target.id));
          newGraveyard.push(card);
          newLog.push(`🔥 ${card.name} destroys your ${target.name}.`);
        } else {
          setPlayerLife(prev => Math.max(0, prev - (card.damage ?? 3)));
          newGraveyard.push(card);
          newLog.push(`⚡ ${card.name} hits you for ${card.damage ?? 3} damage!`);
        }
      }
    }
  }

  setOpponentHand(newHand);
  setOpponentBattlefield(newBattlefield);
  setGraveyard(prev => [...prev, ...newGraveyard]);
  newLog.forEach(msg => setLog(prev => [...prev, msg]));

  const attackers = newBattlefield.filter(c => c.type === "creature" && !c.tapped);
  const blockers = playerBattlefield.filter(c => c.type === "creature");

  let declared = [];

  if (blockers.length === 0) {
    declared = [...attackers];
  } else {
    declared = attackers.filter(a =>
      !blockers.some(b => b.attack >= a.defense)
    );
  }

  if (declared.length > 0) {
    declared.forEach(c => (c.tapped = true));
    setOpponentBattlefield([...newBattlefield]);
    setDeclaredAttackers(declared.map(c => c.id));
    setBlockingPhase(true);
    setLog(prev => [...prev, `🛡️ Awaiting player to assign blockers.`]);
    return;
  }

  setLog(prev => [...prev, `🕒 Opponent ends turn without attacking.`]);
  setOpponentBattlefield([...newBattlefield]);

  currentTurn.current = "player";
  setTimeout(() => {
    setTurnCount(prev => prev + 1);
    setIsPlayerTurn(true);
    hasStartedTurn.current = false;
    isRunningCPU.current = false;
  }, 300);
}
