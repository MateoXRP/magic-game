// src/context/PlayerActions.js
export function playCard(card, state) {
  const {
    isPlayerTurn,
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
    opponentBattlefield,
    selectedTarget,
    setSelectedTarget,
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
      setLog(prev => [...prev, `🧙 Summoned ${card.name} (${card.attack}/${card.defense}).`]);
    } else if (card.type === "spell") {
      setGraveyard(prev => [...prev, card]);

      if (selectedTarget && selectedTarget !== "opponent") {
        // Targeting a creature
        const updated = opponentBattlefield.map(c => {
          if (c.id !== selectedTarget) return c;
          if (c.type !== "creature") return c;
          const newDef = c.defense - card.damage;
          return { ...c, defense: newDef };
        });

        const target = opponentBattlefield.find(c => c.id === selectedTarget);
        const updatedAfterKill = updated.filter(
          c => c.type !== "creature" || c.defense > 0
        );

        setOpponentBattlefield(updatedAfterKill);

        setLog(prev => [
          ...prev,
          target
            ? (target.defense - card.damage <= 0
              ? `🔥 ${card.name} destroys ${target.name}.`
              : `🔥 ${card.name} hits ${target.name} for ${card.damage} damage.`)
            : `🔥 ${card.name} was cast, but target is gone.`,
        ]);
      } else {
        // Targeting opponent directly
        setOpponentLife(hp => Math.max(0, hp - card.damage));
        setLog(prev => [...prev, `⚡ ${card.name} hits opponent for ${card.damage} damage.`]);
      }

      setSelectedTarget(null);
    }
  }
}

export function declareAttacker(cardId, state) {
  const { isPlayerTurn, playerBattlefield, setPlayerBattlefield, setLog } = state;
  if (!isPlayerTurn) return;

  let message = null;

  const newState = playerBattlefield.map(card => {
    if (card.id !== cardId || card.type !== "creature") return card;

    if (card.attacking) {
      message = `↩️ ${card.name} attack canceled.`;
      return { ...card, attacking: false, tapped: false };
    }

    if (card.tapped) {
      message = `🚫 ${card.name} is tapped and cannot attack.`;
      return card;
    }

    message = `⚔️ ${card.name} declared as attacker.`;
    return { ...card, attacking: true, tapped: true };
  });

  setPlayerBattlefield(newState);
  if (message) setLog(prev => [...prev, message]);
}

export function resolveCombat(state) {
  const {
    playerBattlefield,
    opponentBattlefield,
    setPlayerBattlefield,
    setOpponentBattlefield,
    setGraveyard,
    setOpponentLife,
    setLog,
  } = state;

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

      setLog(prev => [...prev, `🛡️ ${blocker.name} blocked ${attacker.name}.`]);
    } else {
      setOpponentLife(hp => Math.max(0, hp - attacker.attack));
      setLog(prev => [...prev, `💥 ${attacker.name} hits opponent for ${attacker.attack} damage.`]);
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

export function startTurn(state) {
  const {
    manaPool,
    setPlayerLife,
    setLog,
    setManaPool,
    setPlayerBattlefield,
    setPlayedLand,
    setHasDrawnCard,
    library,
    setHand,
    setLibrary,
  } = state;

  if (manaPool > 0) {
    setPlayerLife(prev => Math.max(0, prev - manaPool));
    setLog(prev => [...prev, `🔥 You took ${manaPool} mana burn damage!`]);
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
    setLog(prev => [...prev, `📅 Drew a card.`]);
  }
}
