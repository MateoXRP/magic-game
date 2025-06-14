// src/context/PlayerActions/phases/startTurn.js

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

  // 🔥 Mana burn
  const burn = Object.values(manaPool).reduce((a, b) => a + b, 0);
  if (burn > 0) {
    setPlayerLife(prev => Math.max(0, prev - burn));
    setLog(prev => [...prev, `🔥 You took ${burn} mana burn damage!`]);
  }

  // 🧼 Reset mana pool
  setManaPool({ red: 0, green: 0, blue: 0, white: 0, black: 0 });

  // 🔁 Untap and remove temporary buffs
  setPlayerBattlefield(prev =>
    prev.map(c => {
      let updated = { ...c };
      if (updated.type === "creature" || updated.type === "land") {
        updated.tapped = false;
        updated.attacking = false;
        updated.blocking = null;
        updated.damageTaken = 0;
      }
      if (updated.tempBoost) {
        updated.attack -= updated.tempBoost.attack;
        updated.defense -= updated.tempBoost.defense;
        delete updated.tempBoost;
        updated.boosted = false;
      }
      return updated;
    })
  );

  // 🔄 Reset land play and draw status
  setPlayedLand(false);
  setHasDrawnCard(false);

  // 📅 Draw a card
  if (library.length > 0) {
    const drawnCard = library[0];
    setHand(prev => [...prev, drawnCard]);
    setLibrary(prev => prev.slice(1));
    setHasDrawnCard(true);
    setLog(prev => [...prev, `📅 Drew ${drawnCard.name}.`]);
  }
}

