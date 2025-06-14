// src/context/OpponentAI/phases/summonCreature.js

export function summonCreature(hand, battlefield, mana) {
  const creature = hand.find(c => c.type === "creature" && (c.manaCost || 0) <= mana);
  if (!creature) {
    return { hand, battlefield, mana, log: null };
  }

  const updatedBattlefield = [
    ...battlefield,
    {
      ...creature,
      tapped: false,
      attacking: false,
      blocking: null,
      damageTaken: 0,
    },
  ];

  return {
    hand: hand.filter(c => c.id !== creature.id),
    battlefield: updatedBattlefield,
    mana: mana - (creature.manaCost || 0),
    log: `🧙 Opponent summons ${creature.name} (${creature.attack}/${creature.defense}).`,
  };
}

