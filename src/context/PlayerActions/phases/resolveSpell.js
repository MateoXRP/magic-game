// src/context/PlayerActions/phases/resolveSpell.js

export function resolveSpell(targetId, state) {
  const {
    pendingSpell,
    setPendingSpell,
    setSelectedTarget,
    setGraveyard,
    setLog,
    setOpponentBattlefield,
    opponentBattlefield,
    setPlayerBattlefield,
    playerBattlefield,
    setOpponentLife,
  } = state;

  if (!pendingSpell) return;

  const card = pendingSpell;
  setPendingSpell(null);
  setSelectedTarget(null);
  setGraveyard(prev => [...prev, card]);

  if (card.name === "Giant Growth") {
    const updated = playerBattlefield.map(c => {
      if (c.id !== targetId || c.type !== "creature") return c;
      return {
        ...c,
        attack: c.attack + (card.boost?.attack || 3),
        defense: c.defense + (card.boost?.defense || 3),
        boosted: true,
        tempBoost: {
          attack: card.boost?.attack || 3,
          defense: card.boost?.defense || 3,
        },
      };
    });

    const target = playerBattlefield.find(c => c.id === targetId);
    setPlayerBattlefield(updated);
    setLog(prev => [
      ...prev,
      target
        ? `🌿 ${card.name} boosts ${target.name} with +${card.boost.attack}/${card.boost.defense}.`
        : `🌿 ${card.name} was cast, but target is gone.`,
    ]);
  }

  else if (card.name === "Lightning Bolt") {
    if (targetId === "opponent") {
      setOpponentLife(hp => Math.max(0, hp - card.damage));
      setLog(prev => [...prev, `⚡ ${card.name} hits opponent for ${card.damage} damage.`]);
    } else {
      const target = opponentBattlefield.find(c => c.id === targetId);
      if (!target || target.type !== "creature") {
        setLog(prev => [...prev, `❌ Invalid target.`]);
        return;
      }

      const newDefense = target.defense - card.damage;
      const updated = opponentBattlefield.map(c =>
        c.id !== targetId ? c : { ...c, defense: newDefense }
      );

      const remaining = updated.filter(c => c.type !== "creature" || c.defense > 0);
      setOpponentBattlefield(remaining);
      setLog(prev => [
        ...prev,
        newDefense <= 0
          ? `🔥 ${card.name} destroys ${target.name}.`
          : `🔥 ${card.name} hits ${target.name} for ${card.damage} damage.`,
      ]);
    }
  }

  else if (card.name === "Tsunami") {
    const target = opponentBattlefield.find(c => c.id === targetId);
    if (!target || target.type !== "land") {
      setLog(prev => [...prev, `❌ Invalid target for ${card.name}.`]);
      return;
    }

    const remaining = opponentBattlefield.filter(c => c.id !== targetId);
    setOpponentBattlefield(remaining);
    setLog(prev => [...prev, `🌊 ${card.name} destroys opponent's ${target.name}.`]);
  }
}
