// src/components/Hand.jsx
import { useGame } from "../context/GameContext";
import Card from "./Card";

export default function Hand() {
  const { hand, playCard } = useGame();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {hand.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={() => playCard(card)}
        />
      ))}
    </div>
  );
}
