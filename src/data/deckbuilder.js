// src/data/deckBuilder.js

/**
 * Combines two mono-color decks into a single shuffled 40-card deck.
 * @param {Array} deckA - First 20-card deck
 * @param {Array} deckB - Second 20-card deck
 * @returns {Array} 40-card shuffled deck
 */
export function createDualColorDeck(deckA, deckB) {
  if (!Array.isArray(deckA) || !Array.isArray(deckB)) {
    throw new Error("Both deckA and deckB must be arrays.");
  }

  const combined = [...deckA, ...deckB];

  if (combined.length !== 40) {
    console.warn("Expected 40 cards after combining decks. Check input deck sizes.");
  }

  return combined.sort(() => 0.5 - Math.random());
}

