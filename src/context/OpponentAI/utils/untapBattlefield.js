// src/context/OpponentAI/phases/untapBattlefield.js

export function untapBattlefield(battlefield) {
  return battlefield.map(c => {
    const untapped = { ...c, tapped: false, attacking: false };
    delete untapped.tempAttack;
    delete untapped.tempDefense;
    return untapped;
  });
}
