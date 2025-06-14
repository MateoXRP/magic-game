// src/utils.js

export function getCardColor(card) {
    const map = {
      red: "bg-red-600",
      green: "bg-green-600",
      blue: "bg-blue-600",
      white: "bg-gray-200", // light gray for white cards
      black: "bg-gray-800",
    };
    return map[card?.color] || "bg-gray-500";
  }
  
  export function getEffectiveAttack(card, battlefield) {
    if (card.type !== "creature") return 0;
  
    let bonus = 0;
  
    if (card.name === "Goblin" && battlefield.some(c => c.name === "Goblin Chief")) bonus += 1;
    if (card.name === "Goblin Chief" && battlefield.some(c => c.name === "War Drummer")) bonus += 1;
  
    if (card.name === "Elvish Scout" && battlefield.some(c => c.name === "Forest Bear")) bonus += 1;
    if (card.name === "Forest Bear" && battlefield.some(c => c.name === "Ancient Treefolk")) bonus += 1;
  
    if (card.name === "Skeleton" && battlefield.some(c => c.name === "Zombie")) bonus += 1;
    if (card.name === "Zombie" && battlefield.some(c => c.name === "Dreadlord")) bonus += 1;
  
    return (card.attack || 0) + bonus + (card.tempAttack || 0);
  }
  
  export function getEffectiveDefense(card, battlefield) {
    if (card.type !== "creature") return 0;
  
    let bonus = 0;
  
    if (card.name === "Merfolk Scout" && battlefield.some(c => c.name === "Sea Serpent")) bonus += 1;
    if (card.name === "Sea Serpent" && battlefield.some(c => c.name === "Ancient Leviathan")) bonus += 1;
  
    if (card.name === "Soldier" && battlefield.some(c => c.name === "Knight")) bonus += 1;
    if (card.name === "Knight" && battlefield.some(c => c.name === "Paladin")) bonus += 1;
  
    return (card.defense || 0) + bonus + (card.tempDefense || 0);
  }
  
  export function isValidTarget(card, targetType, playerBattlefield, opponentBattlefield) {
    if (!targetType || !card) return false;
  
    const allowed = targetType.split("|");
  
    if (card === "opponent") return allowed.includes("opponent");
  
    if (opponentBattlefield.includes(card)) {
      if (card.type === "creature" && allowed.includes("opponent-creature")) return true;
      if (card.type === "land" && allowed.includes("opponent-land")) return true;
      return false;
    }
  
    if (playerBattlefield.includes(card)) {
      if (card.type === "creature" && allowed.includes("self-creature")) return true;
      if (card.type === "land" && allowed.includes("self-land")) return true;
      return false;
    }
  
    return false;
  }
  