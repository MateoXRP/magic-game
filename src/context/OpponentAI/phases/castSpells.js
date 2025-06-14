// src/context/OpponentAI/phases/castSpells.js

export function castSpells(hand, battlefield, playerBattlefield, mana) {
  const logs = [];
  const graveyard = [];
  let updatedBattlefield = [...battlefield];
  let updatedPlayerBattlefield = [...playerBattlefield];
  let updatedHand = [...hand];
  let updatedMana = { ...mana };

  try {
    const playableSpells = hand.filter(c => {
      if (c.type !== "spell" || !c.manaCost || !c.color) return false;
      const total = Object.values(mana).reduce((a, b) => a + b, 0);
      return mana[c.color] > 0 && total >= c.manaCost;
    });

    for (const spell of playableSpells) {
      let target = null;

      // Deduct mana (1 of its own color, rest from any)
      let newMana = { ...updatedMana };
      newMana[spell.color]--;

      let remaining = spell.manaCost - 1;
      for (const color of Object.keys(newMana)) {
        while (remaining > 0 && newMana[color] > 0) {
          newMana[color]--;
          remaining--;
        }
      }

      // Only proceed if we had enough mana
      if (remaining > 0) continue;

      if (spell.name === "Lightning Bolt") {
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
          // Damage to player handled in index.js
        }
      }

      if (spell.name === "Holy Water") {
        logs.push(`💧 Opponent casts Holy Water.`);
        // Healing handled in index.js
      }

      if (spell.name === "Giant Growth") {
        const targets = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);
        target = targets[0];
        if (target) {
          logs.push(`🌿 Opponent casts Giant Growth on ${target.name}.`);
          target.tempAttack = (target.tempAttack || 0) + 3;
          target.tempDefense = (target.tempDefense || 0) + 3;
        } else {
          logs.push(`🌿 Opponent holds Giant Growth (no target).`);
          continue;
        }
      }

      updatedMana = newMana;
      graveyard.push(spell);
      updatedHand = updatedHand.filter(c => c.id !== spell.id);
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
