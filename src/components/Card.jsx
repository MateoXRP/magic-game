// src/components/Card.jsx
import { getCardColor, getEffectiveAttack, getEffectiveDefense } from "../utils";

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
  dimmed = null,
}) {
  const isFullyTapped =
    card.type === "land" ? tappedCount >= (groupedCount || 1) : card.tapped;

  const isDimmed = dimmed ?? (isFullyTapped && !card.justPlayed);

  const effectiveAttack =
    card.type === "creature" ? getEffectiveAttack(card, battlefield) : null;
  const effectiveDefense =
    card.type === "creature" ? getEffectiveDefense(card, battlefield) : null;

  let borderClass = "border-gray-500";
  if (isSelected) borderClass = "border-blue-400 border-4";
  else if (isAssigned) borderClass = "border-green-400 border-4";
  else if (isAttacking) borderClass = "border-red-500 border-4";
  else if (isTargetable) borderClass = "border-yellow-400 border-4";

  const cardColorClass = getCardColor(card);
  const tappedStyle = isDimmed
    ? "opacity-70 brightness-90 border-gray-400"
    : "";

  const isWhiteCard = card.color === "white";
  const textColorClass = isWhiteCard ? "text-black" : "text-white";

  return (
    <div
      onClick={onClick}
      className={`w-[100px] h-[120px] rounded flex flex-col justify-center items-center text-center ${textColorClass} cursor-pointer shadow-md ${borderClass} ${cardColorClass} ${tappedStyle}`}
    >
      <div className="text-3xl">{card.emoji}</div>
      <div className="text-sm font-bold mt-1 px-1">{card.name}</div>

      {card.type === "creature" && (
        <div className="text-xs mt-1">
          {effectiveAttack}/{effectiveDefense}
        </div>
      )}

      {groupedCount !== null && (
        <div className="text-xs mt-1 italic">x{groupedCount - tappedCount}</div>
      )}

      {label && (
        <div className="text-xs mt-1 text-blue-200 font-bold">{label}</div>
      )}

      {showCost && card.manaCost !== undefined && (
        <div className="text-xs mt-1">Cost: {card.manaCost}</div>
      )}
    </div>
  );
}
