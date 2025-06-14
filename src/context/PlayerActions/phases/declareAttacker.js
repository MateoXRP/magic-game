// src/context/PlayerActions/phases/declareAttacker.js

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

