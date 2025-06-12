// src/utils.js

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
  
  export function getEffectiveAttack(card, battlefield) {
    const hasChief =
      card.name === "Goblin" &&
      battlefield.some(c => c.name === "Goblin Chief" && c.id !== card.id);
  
    return hasChief ? card.attack + 1 : card.attack;
  }
  
  /**
   * Determine if a card is a valid target for a spell based on `targetType`
   */
  export function isValidTarget(card, targetType, playerBattlefield, opponentBattlefield) {
    const isOpponent = opponentBattlefield.includes(card);
    const isPlayer = playerBattlefield.includes(card);
  
    const types = targetType.split("|");
  
    return types.some(type => {
      switch (type) {
        case "opponent":
          return isOpponent && card.type !== "creature";
        case "opponent-creature":
          return isOpponent && card.type === "creature";
        case "self-creature":
          return isPlayer && card.type === "creature";
        default:
          return false;
      }
    });
  }
  