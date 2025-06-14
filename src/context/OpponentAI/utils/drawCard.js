// src/context/OpponentAI/utils/drawCard.js

export function drawCard(library, hand) {
  if (library.length > 0) {
    const drawn = library[0];
    return {
      hand: [...hand, drawn],
      library: library.slice(1),
      log: `📅 Opponent draws ${drawn.name}.`,
    };
  }

  // ✅ Always log if the deck is empty
  return {
    hand,
    library,
    log: "📭 Opponent's library is empty.",
  };
}
