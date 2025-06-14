// src/context/OpponentAI/phases/castSpells.js

export function castSpells(hand, battlefield, playerBattlefield, mana, playerLife = 20, opponentLife = 20, opponentLibrary = [], turnCount = 1) {
  const logs = [];
  const graveyard = [];
  let updatedBattlefield = [...battlefield];
  let updatedPlayerBattlefield = [...playerBattlefield];
  let updatedHand = [...hand];
  let updatedMana = { ...mana };

  try {
    const playableSpells = hand.filter(c => {
      if (c.type !== "spell" || !c.manaCost || !c.color) return false;
      const total = Object.values(updatedMana).reduce((a, b) => a + b, 0);
      return updatedMana[c.color] > 0 && total >= c.manaCost;
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

      if (remaining > 0) continue;

      if (spell.name === "Lightning Bolt") {
        const targets = updatedPlayerBattlefield
          .filter(c => c.type === "creature")
          .sort((a, b) => (b.tempAttack || b.attack) - (a.tempAttack || a.attack));
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
        }
      }

      if (spell.name === "Giant Growth") {
        const candidates = updatedBattlefield.filter(c => c.type === "creature" && !c.tapped);
        target = candidates.find(c => c.attack <= 2 || c.tempAttack); // Buff weakest attacker

        if (target) {
          logs.push(`🌿 Opponent casts Giant Growth on ${target.name}.`);
          target.tempAttack = (target.tempAttack || 0) + 3;
          target.tempDefense = (target.tempDefense || 0) + 3;
        } else {
          logs.push(`🌿 Opponent holds Giant Growth (no valid target).`);
          continue;
        }
      }

      if (spell.name === "Pestilence") {
        const targetCount = updatedPlayerBattlefield.filter(c => c.type === "creature").length;

        if (targetCount >= 2) {
          logs.push(`☠️ Opponent casts Pestilence, dealing ${targetCount} damage to the player.`);
          state.setPlayerLife(prev => Math.max(0, prev - targetCount));
        } else {
          logs.push(`☠️ Opponent holds Pestilence (not enough creatures to punish).`);
          continue;
        }
      }

      if (spell.name === "Tsunami") {
        const landCounts = updatedPlayerBattlefield
          .filter(c => c.type === "land")
          .reduce((acc, c) => {
            acc[c.color] = (acc[c.color] || 0) + 1;
            return acc;
          }, {});

        const totalLands = Object.values(landCounts).reduce((a, b) => a + b, 0);

        if (totalLands <= 3 && opponentLibrary.length >= 30) {
          const [colorToHit] = Object.entries(landCounts).sort((a, b) => a[1] - b[1])[0] || [];

          if (colorToHit) {
            const landToDestroy = updatedPlayerBattlefield.find(
              c => c.type === "land" && c.color === colorToHit
            );

            if (landToDestroy) {
              logs.push(`🌊 Opponent casts Tsunami, destroying 1 ${landToDestroy.name}.`);
              updatedPlayerBattlefield = updatedPlayerBattlefield.filter(c => c.id !== landToDestroy.id);
            } else {
              logs.push(`🌊 Opponent holds Tsunami (no valid target).`);
              continue;
            }
          } else {
            logs.push(`🌊 Opponent holds Tsunami (no valid target).`);
            continue;
          }
        } else {
          logs.push(`🌊 Opponent holds Tsunami (too late to slow player).`);
          continue;
        }
      }

      if (spell.name === "Holy Water") {
        const otherOptions = playableSpells.filter(s => s.name !== "Holy Water");
        if (opponentLife <= 10 && otherOptions.length <= 1) {
          logs.push(`💧 Opponent casts Holy Water to heal.`);
        } else {
          logs.push(`💧 Opponent holds Holy Water (not needed).`);
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
