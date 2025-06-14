// src/context/OpponentAI/utils/untapBattlefield.js

export function untapBattlefield(battlefield) {
  return battlefield.map(c => ({
    ...c,
    tapped: false,
    attacking: false,
    blocking: null,
    damageTaken: 0,
  }));
}

