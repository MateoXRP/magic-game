// src/components/Card.jsx
import { getCardColor, getEffectiveAttack } from "../utils";

export default function Card({
  card,
  battlefield = [],
  onClick,
  isSelected = false,
  isAssigned = false,
  isAttacking = false,
  isTargetable = false,
  groupedCount = null,
  tappedCount = 0,
  label = "",
  showCost = false,
}) {
  const isFullyTapped =
    card.type === "land" ? tappedCount >= (groupedCount || 1) : card.tapped;
  const effectiveAttack = card.type === "creature"
    ? getEffectiveAttack(card, battlefield)
    : null;

  let borderClass = "border-gray-500";
  if (isSelected) borderClass = "border-blue-400 border-4";
  else if (isAssigned) borderClass = "border-green-400 border-4";
  else if (isAttacking) borderClass = "border-red-500 border-4";
  else if (isTargetable) borderClass = "border-yellow-400 border-4";

  const manaSymbol = card.color === "red" ? "🔥" : card.color === "green" ? "🌲" : "";

  return (
    <div
      onClick={onClick}
      className={`p-2 border rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center ${borderClass} ${
        isFullyTapped ? "bg-gray-500 text-white" : getCardColor(card.color)
      }`}
    >
      <div className="text-2xl">{card.emoji}</div>
      <div className="font-bold text-sm">{card.name}</div>

      {/* Creature stats */}
      {card.type === "creature" && (
        <div className="text-xs mt-1">
          {effectiveAttack}/{card.defense}
        </div>
      )}

      {/* Mana cost shown only in hand */}
      {showCost && card.type !== "land" && card.manaCost != null && (
        <div className="text-xs mt-1">Cost: {card.manaCost} {manaSymbol}</div>
      )}

      {/* Grouped land count */}
      {card.type === "land" && groupedCount > 1 && (
        <div className="text-xs mt-1">{groupedCount - tappedCount}</div>
      )}

      {/* Status labels */}
      {label && <div className="text-xs italic mt-1">{label}</div>}
      {isAttacking && <div className="text-xs text-red-300">⚔️ Attacking</div>}
    </div>
  );
}
