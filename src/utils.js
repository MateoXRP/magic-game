// src/utils.js

/**
 * Returns the Tailwind color class for a card based on its color.
 */
export function getCardColor(color) {
    switch (color) {
      case "red":
        return "bg-red-700 text-white";
      case "green":
        return "bg-green-700 text-white";
      case "blue":
        return "bg-blue-700 text-white";
      case "white":
        return "bg-yellow-200 text-black";
      case "black":
        return "bg-gray-800 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  }
  
  /**
   * Calculates effective attack value, applying buffs if relevant.
   * Currently supports Goblin Chief's +1 buff to other Goblins.
   */
  export function getEffectiveAttack(card, battlefield) {
    const hasChief =
      card.name === "Goblin" &&
      battlefield.some(c => c.name === "Goblin Chief" && c.id !== card.id);
  
    return hasChief ? card.attack + 1 : card.attack;
  }
  