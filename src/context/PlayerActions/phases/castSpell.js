// src/context/PlayerActions/phases/castSpell.js
export function playCard(card, state) {
  const {
    isPlayerTurn,
    hand,
    setHand,
    setPlayerBattlefield,
    setGraveyard,
    manaPool,
    setManaPool,
    playedLand,
    setPlayedLand,
    setLog,
    setOpponentLife,
    setPlayerLife,
    opponentBattlefield,
    selectedTarget,
    setSelectedTarget,
    playerBattlefield,
    pendingSpell,
    setPendingSpell,
  } = state;

  if (!isPlayerTurn) return;

  const isInHand = hand.find(c => c.id === card.id);
  if (!isInHand) return;

  if (card.type === "land") {
    if (playedLand) return;
    setPlayedLand(true);
    setPlayerBattlefield(prev => [...prev, { ...card, tapped: false }]);
    setHand(prev => prev.filter(c => c.id !== card.id));
    setLog(prev => [...prev, `🪨 Played ${card.name}.`]);
    return;
  }

  const cost = card.manaCost || 0;
  const totalAvailable = Object.values(manaPool).reduce((a, b) => a + b, 0);
  const availableColor = manaPool[card.color] || 0;

  if (cost > totalAvailable || availableColor < 1) {
    return alert(`You need at least 1 ${card.color} mana and ${cost} total mana to play this card.`);
  }

  const newMana = { ...manaPool, [card.color]: manaPool[card.color] - 1 };
  let remaining = cost - 1;

  for (const color of Object.keys(manaPool)) {
    while (remaining > 0 && newMana[color] > 0) {
      newMana[color]--;
      remaining--;
    }
  }

  setManaPool(newMana);
  setHand(prev => prev.filter(c => c.id !== card.id));
  setLog(prev => [...prev, `🔥 Spent ${cost} mana to cast ${card.name}.`]);

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
    setLog(prev => [
      ...prev,
      `🧙 Summoned ${card.name} (${card.attack}/${card.defense}).`,
      card.special ? `✨ ${card.name} — ${card.special}` : null,
    ].filter(Boolean));
  } else if (card.type === "spell") {
    if (card.targetType) {
      setPendingSpell(card);
      setLog(prev => [...prev, `🎯 Select a target for ${card.name}.`]);
    } else {
      setGraveyard(prev => [...prev, card]);

      if (card.name === "Holy Water") {
        setPlayerLife(life => life + (card.heal ?? 3));
        setLog(prev => [...prev, `💧 ${card.name} restores ${card.heal ?? 3} life.`]);
      } else if (card.name === "Pestilence") {
        const creatureCount = opponentBattlefield.filter(c => c.type === "creature").length;
        setOpponentLife(hp => Math.max(0, hp - creatureCount));
        setLog(prev => [...prev, `☠️ ${card.name} deals ${creatureCount} damage to opponent.`]);
      } else {
        setLog(prev => [...prev, `✨ ${card.name} resolves with no target.`]);
      }
    }
  }
}

