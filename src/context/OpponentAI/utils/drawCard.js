// src/context/OpponentAI/phases/drawCard.js

export function drawCard(library, hand) {
  const logs = [];

  if (library.length === 0) {
    logs.push("📭 Opponent's library is empty.");
    return { library, hand, log: logs.join("\n") };
  }

  const [card, ...remainingLibrary] = library;
  const updatedHand = [...hand, card];
  logs.push(`📅 Opponent draws ${card.name}.`);

  return { library: remainingLibrary, hand: updatedHand, log: logs.join("\n") };
}
