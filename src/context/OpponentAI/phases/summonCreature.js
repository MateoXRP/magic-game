// src/context/OpponentAI/phases/summonCreature.js

export function summonCreature(hand, battlefield, mana) {
  let updatedHand = [...hand];
  let updatedBattlefield = [...battlefield];
  let availableMana = mana;
  const logs = [];

  // Sort creatures by mana cost descending to prioritize strongest
  const creatures = updatedHand
    .filter(c => c.type === "creature" && (c.manaCost || 0) <= availableMana)
    .sort((a, b) => (b.manaCost || 0) - (a.manaCost || 0));

  for (const creature of creatures) {
    const cost = creature.manaCost || 0;
    if (cost > availableMana) continue;

    // Summon creature
    updatedBattlefield.push({
      ...creature,
      tapped: false,
      attacking: false,
      blocking: null,
      damageTaken: 0,
    });
    updatedHand = updatedHand.filter(c => c.id !== creature.id);
    availableMana -= cost;
    logs.push(`🧙 Opponent summons ${creature.name} (${creature.attack}/${creature.defense}).`);
  }

  return {
    hand: updatedHand,
    battlefield: updatedBattlefield,
    mana: availableMana,
    log: logs.length > 0 ? logs.join("\n") : null,
  };
}
