// src/context/OpponentAI/phases/castSpells.js

export function castSpells(hand, battlefield, playerBattlefield, mana) {
  const logs = [];
  const graveyard = [];
  let updatedBattlefield = [...battlefield];
  let updatedPlayerBattlefield = [...playerBattlefield];
  let updatedHand = [...hand];
  let updatedMana = mana;

  try {
    const playableSpells = hand.filter(
      c => c.type === "spell" && (c.manaCost || 0) <= mana
    );

    for (const spell of playableSpells) {
      if ((spell.name === "Lightning Bolt" || spell.name === "Holy Water") && updatedMana >= spell.manaCost) {
        let target = null;

        if (spell.name === "Lightning Bolt") {
          // Target strongest opposing creature first
          const targets = updatedPlayerBattlefield
            .filter(c => c.type === "creature")
            .sort((a, b) => b.attack - a.attack);

          target = targets[0];

          if (target) {
            logs.push(`⚡ Opponent casts Lightning Bolt on ${target.name}.`);
            target.defense -= 3;
            if (target.defense <= 0) {
              logs.push(`☠️ ${target.name} is destroyed.`);
              updatedPlayerBattlefield = updatedPlayerBattlefield.filter(c => c.id !== target.id);
            }
          } else {
            logs.push(`⚡ Opponent casts Lightning Bolt directly at player.`);
            // We’ll deduct player life in index.js
          }
        }

        if (spell.name === "Holy Water") {
          logs.push(`💧 Opponent casts Holy Water.`);
          // Restore opponent life up to 20
        }

        updatedMana -= spell.manaCost;
        graveyard.push(spell);
        updatedHand = updatedHand.filter(c => c.id !== spell.id);
      }

      // Giant Growth — skip if no creature on battlefield
      if (spell.name === "Giant Growth" && updatedMana >= spell.manaCost) {
        const targets = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);
        const target = targets[0];
        if (target) {
          logs.push(`🌿 Opponent casts Giant Growth on ${target.name}.`);
          target.tempAttack = (target.tempAttack || 0) + 3;
          target.tempDefense = (target.tempDefense || 0) + 3;

          updatedMana -= spell.manaCost;
          graveyard.push(spell);
          updatedHand = updatedHand.filter(c => c.id !== spell.id);
        } else {
          logs.push(`🌿 Opponent holds Giant Growth (no target).`);
        }
      }
    }

    if (logs.length === 0) {
      logs.push("🤖 Opponent casts no spells this turn.");
    }

  } catch (error) {
    logs.push(`🛑 CPU spell error: ${error.message}`);
    console.error("Spell casting error:", error);
  }

  return {
    hand: updatedHand,
    battlefield: updatedBattlefield,
    updatedPlayerBattlefield,
    graveyard,
    mana: updatedMana,
    logs,
  };
}
