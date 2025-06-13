// src/utils.js

// Passive buff rules
const BUFF_RULES = [
    { source: "Goblin Chief", target: "Goblin", attack: 1, defense: 0 },
    { source: "War Drummer", target: "Goblin Chief", attack: 1, defense: 0 },
    { source: "Forest Bear", target: "Elvish Scout", attack: 1, defense: 0 },
    { source: "Ancient Treefolk", target: "Forest Bear", attack: 1, defense: 0 },
    { source: "Zombie", target: "Skeleton", attack: 1, defense: 0 },
    { source: "Dreadlord", target: "Zombie", attack: 1, defense: 0 },
    { source: "Knight", target: "Soldier", attack: 0, defense: 1 },
    { source: "Paladin", target: "Knight", attack: 0, defense: 1 },
    { source: "Sea Serpent", target: "Merfolk Scout", attack: 0, defense: 1 },
    { source: "Ancient Leviathan", target: "Sea Serpent", attack: 0, defense: 1 },
  ];
  
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
    if (card.type !== "creature") return 0;
  
    let totalBuff = 0;
  
    BUFF_RULES.forEach(rule => {
      if (card.name === rule.target) {
        const sources = battlefield.filter(
          c => c.name === rule.source && c.id !== card.id
        );
        totalBuff += sources.length * rule.attack;
      }
    });
  
    return card.attack + totalBuff;
  }
  
  export function getEffectiveDefense(card, battlefield) {
    if (card.type !== "creature") return 0;
  
    let totalBuff = 0;
  
    BUFF_RULES.forEach(rule => {
      if (card.name === rule.target) {
        const sources = battlefield.filter(
          c => c.name === rule.source && c.id !== card.id
        );
        totalBuff += sources.length * rule.defense;
      }
    });
  
    return card.defense + totalBuff;
  }
  
  /**
   * Determine if a card is a valid target for a spell based on `targetType`
   */
  export function isValidTarget(card, targetType, playerBattlefield, opponentBattlefield) {
    const isOpponent = opponentBattlefield.includes(card);
    const isPlayer = playerBattlefield.includes(card);
  
    const types = targetType?.split("|") ?? [];
  
    return types.some(type => {
      switch (type) {
        case "opponent":
          return isOpponent && card.type !== "creature";
        case "opponent-creature":
          return isOpponent && card.type === "creature";
        case "opponent-land":
          return isOpponent && card.type === "land";
        case "self-creature":
          return isPlayer && card.type === "creature";
        default:
          return false;
      }
    });
  }
  