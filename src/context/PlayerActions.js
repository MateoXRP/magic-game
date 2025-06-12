// src/context/PlayerActions.js

import { resolveCombatPhase } from "../engine/combatEngine";

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
    playerBattlefield,
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
  const totalAvailable = (manaPool.red || 0) + (manaPool.green || 0);
  const availableColor = manaPool[card.color] || 0;

  if (cost > totalAvailable || availableColor < 1) {
    return alert(`You need at least 1 ${card.color} mana and ${cost} total mana to play this card.`);
  }

  const newMana = { ...manaPool, [card.color]: manaPool[card.color] - 1 };
  let remaining = cost - 1;

  for (const color of ["red", "green"]) {
    while (remaining > 0 && newMana[color] > 0) {
      newMana[color]--;
      remaining--;
    }
  }

  setManaPool(newMana);
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
    setLog(prev => [
      ...prev,
      `🧙 Summoned ${card.name} (${card.attack}/${card.defense}).`,
      card.special ? `✨ ${card.name} — ${card.special}` : null,
    ].filter(Boolean));
  } else if (card.type === "spell") {
    setGraveyard(prev => [...prev, card]);

    if (card.name === "Giant Growth" && selectedTarget) {
      const updated = playerBattlefield.map(c => {
        if (c.id !== selectedTarget || c.type !== "creature") return c;
        return {
          ...c,
          attack: c.attack + (card.boost?.attack || 3),
          defense: c.defense + (card.boost?.defense || 3),
          boosted: true,
        };
      });

      const target = playerBattlefield.find(c => c.id === selectedTarget);
      setPlayerBattlefield(updated);
      setLog(prev => [
        ...prev,
        target
          ? `🌿 ${card.name} boosts ${target.name} with +${card.boost.attack}/${card.boost.defense}.`
          : `🌿 ${card.name} was cast, but target is gone.`,
      ]);
    } else if (card.damage) {
      if (selectedTarget && selectedTarget !== "opponent") {
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
        setOpponentLife(hp => Math.max(0, hp - card.damage));
        setLog(prev => [...prev, `⚡ ${card.name} hits opponent for ${card.damage} damage.`]);
      }
    }

    setSelectedTarget(null);
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
  resolveCombatPhase(state);
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

  const burn = Object.values(manaPool).reduce((a, b) => a + b, 0);
  if (burn > 0) {
    setPlayerLife(prev => Math.max(0, prev - burn));
    setLog(prev => [...prev, `🔥 You took ${burn} mana burn damage!`]);
  }

  setManaPool({ red: 0, green: 0 });

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
