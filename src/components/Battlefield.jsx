import { useGame } from "../context/GameContext";
import { useState, useEffect } from "react";

export default function Battlefield() {
  const {
    playerBattlefield,
    setPlayerBattlefield,
    setManaPool,
    declareAttacker,
    blockingPhase,
    declaredAttackers,
    opponentBattlefield,
    blockAssignments,
    setBlockAssignments,
  } = useGame();

  const [selectedBlocker, setSelectedBlocker] = useState(null);

  // ✅ Reset blue border after combat resolves
  useEffect(() => {
    if (!blockingPhase) setSelectedBlocker(null);
  }, [blockingPhase]);

  function handleClick(cardName, cardType, cardId) {
    if (blockingPhase) {
      const card = playerBattlefield.find(c => c.id === cardId);
      if (card && !card.tapped && card.type === "creature") {
        setSelectedBlocker(prev => (prev === cardId ? null : cardId));
      }
      return;
    }

    if (cardType === "creature") {
      declareAttacker(cardId);
      return;
    }

    if (cardType === "land") {
      let tapped = false;

      const updated = playerBattlefield.map(c => {
        if (!tapped && c.type === "land" && c.name === cardName && !c.tapped) {
          tapped = true;
          return { ...c, tapped: true };
        }
        return c;
      });

      if (tapped) {
        setPlayerBattlefield(updated);
        setManaPool(prev => prev + 1);
      }
    }
  }

  function assignBlock(attackerId) {
    if (!selectedBlocker) return;
    setBlockAssignments(prev => ({
      ...prev,
      [attackerId]: selectedBlocker,
    }));
    setSelectedBlocker(null);
  }

  const creatures = playerBattlefield.filter(c => c.type === "creature");

  const landGroups = playerBattlefield
    .filter(c => c.type === "land")
    .reduce((acc, card) => {
      const key = card.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(card);
      return acc;
    }, {});

  function renderCard(card, count = 1, tappedCount = 0) {
    const isTappable = card.type === "land" ? tappedCount < count : true;
    const isSelected = card.id === selectedBlocker;
    const isAssigned = Object.values(blockAssignments).includes(card.id);
    const isFullyTapped = tappedCount >= count;

    let border = "border-gray-500";
    if (isSelected) border = "border-blue-400 border-4";
    else if (isAssigned) border = "border-green-400 border-4";
    else if (card.attacking) border = "border-red-500 border-4";

    return (
      <div
        key={card.id + (count > 1 ? `-${count}` : "")}
        onClick={() => isTappable && handleClick(card.name, card.type, card.id)}
        className={`p-2 border rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center
          ${border}
          ${(card.type === "creature" && card.tapped) || (card.type === "land" && isFullyTapped)
            ? "bg-gray-500 text-white"
            : getCardColor(card.color)}`}
      >
        <div className="text-2xl">{getCardEmoji(card)}</div>
        <div className="font-bold text-sm">{card.name}</div>
        {card.type === "creature" && (
          <div className="text-xs mt-1">
            {getEffectiveAttack(card, playerBattlefield)}/{card.defense}
          </div>
        )}
        {card.type === "land" && count > 1 && (
          <div className="text-xs mt-1">{count - tappedCount}</div>
        )}
        {card.attacking && (
          <div className="text-xs text-red-300">⚔️ Attacking</div>
        )}
        {isFullyTapped && card.type === "land" && (
          <div className="text-xs italic">all tapped</div>
        )}
        {card.tapped && card.type === "creature" && (
          <div className="text-xs italic text-white">tapped</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 px-2">
      <div className="border border-gray-700 p-4 rounded w-full max-w-4xl overflow-y-auto min-h-[180px]">
        <h2 className="text-lg font-bold mb-4 text-center">Your Battlefield</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(landGroups).map(([name, group]) => {
            const first = group[0];
            const tappedCount = group.filter(c => c.tapped).length;
            return renderCard(first, group.length, tappedCount);
          })}
          {creatures.map(renderCard)}
        </div>

        {blockingPhase && selectedBlocker && (
          <>
            <h3 className="text-sm mt-4 font-semibold text-blue-300 text-center">Choose enemy to block:</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {declaredAttackers.map(attackerId => {
                const attacker = opponentBattlefield.find(c => c.id === attackerId);
                if (!attacker) return null;
                return (
                  <div
                    key={attacker.id}
                    onClick={() => assignBlock(attacker.id)}
                    className={`p-2 border border-yellow-400 rounded cursor-pointer w-[100px] h-[120px] text-center flex flex-col justify-center
                      ${attacker.tapped ? "bg-gray-500 text-white" : getCardColor(attacker.color)}`}
                  >
                    <div className="text-2xl">{getCardEmoji(attacker)}</div>
                    <div className="font-bold text-sm">{attacker.name}</div>
                    <div className="text-xs mt-1">
                      {getEffectiveAttack(attacker, opponentBattlefield)}/{attacker.defense}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getCardColor(color) {
  switch (color) {
    case "red":
      return "bg-red-700 text-white";
    case "blue":
      return "bg-blue-700 text-white";
    case "green":
      return "bg-green-700 text-white";
    case "white":
      return "bg-yellow-200 text-black";
    case "black":
      return "bg-gray-800 text-white";
    default:
      return "bg-gray-600 text-white";
  }
}

function getCardEmoji(card) {
  if (card.name === "Mountain") return "⛰️";
  if (card.name === "Goblin" || card.name === "Goblin Chief") return "👺";
  if (card.name === "Lightning Bolt") return "⚡";
  return "🎴";
}

function getEffectiveAttack(card, battlefield) {
  const hasChief = battlefield.some(
    c => c.name === "Goblin Chief" && c.id !== card.id
  );
  if (hasChief && card.name === "Goblin") {
    return card.attack + 1;
  }
  return card.attack;
}
