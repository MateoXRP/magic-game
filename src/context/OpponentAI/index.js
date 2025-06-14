// src/context/OpponentAI/index.js

import { castSpells } from "./phases/castSpells";
import { summonCreature } from "./phases/summonCreature";
import { declareAttackers } from "./phases/declareAttackers";
import { drawCard } from "./utils/drawCard";
import { playLand } from "./utils/playLand";
import { generateMana } from "./utils/generateMana";
import { untapBattlefield } from "./utils/untapBattlefield";

export function runOpponentTurn(state, onComplete = () => {}) {
  const {
    opponentHand,
    setOpponentHand,
    opponentLibrary,
    setOpponentLibrary,
    setOpponentBattlefield,
    opponentBattlefield,
    setGraveyard,
    setOpponentMana,
    setOpponentPlayedLand,
    setPlayerLife,
    setOpponentLife,
    playerBattlefield,
    setPlayerBattlefield,
    setLog,
    setDeclaredAttackers,
    setBlockingPhase,
    gameOver,
    playerLife,
    opponentLife,
    turnCount,
  } = state;

  if (gameOver) return;

  setTimeout(() => {
    const logMessages = [];
    let hand = [...opponentHand];
    let library = [...opponentLibrary];
    let battlefield = untapBattlefield([...opponentBattlefield]);
    let graveyard = [];
    let mana = { red: 0, green: 0, blue: 0, white: 0, black: 0 };
    let playedLand = false;
    let updatedPlayerBattlefield = [...playerBattlefield];
    let tookAction = false;
    let totalDamage = 0;

    try {
      logMessages.push(`🤖 Opponent's turn begins.`);
      logMessages.push(`🧠 Hand: ${hand.map(c => c.name).join(", ")}`);
      logMessages.push(`🔄 Untapped all battlefield cards.`);

      const drawResult = drawCard(library, hand);
      hand = drawResult.hand;
      library = drawResult.library;
      if (drawResult.log) logMessages.push(drawResult.log);

      const landResult = playLand(hand, battlefield);
      hand = landResult.hand;
      battlefield = landResult.battlefield;
      playedLand = landResult.playedLand;
      if (landResult.log) {
        logMessages.push(landResult.log);
        tookAction = true;
      }

      const manaResult = generateMana(battlefield);
      battlefield = manaResult.battlefield;
      mana = manaResult.mana;
      logMessages.push(manaResult.log);

      const spellResult = castSpells(
        hand,
        battlefield,
        updatedPlayerBattlefield,
        mana,
        playerLife,
        opponentLife,
        library,
        turnCount
      );

      hand = spellResult.hand;
      battlefield = spellResult.battlefield;
      updatedPlayerBattlefield = spellResult.updatedPlayerBattlefield;
      graveyard = spellResult.graveyard;
      mana = spellResult.mana;
      spellResult.logs.forEach(msg => logMessages.push(msg));
      if (spellResult.logs.length > 0) tookAction = true;

      const summonResult = summonCreature(hand, battlefield, Object.values(mana).reduce((a, b) => a + b, 0));
      hand = summonResult.hand;
      battlefield = summonResult.battlefield;
      if (summonResult.log) {
        logMessages.push(summonResult.log);
        tookAction = true;
      }

      const attackResult = declareAttackers(battlefield, updatedPlayerBattlefield);
      battlefield = attackResult.battlefield;
      totalDamage = attackResult.totalDamage;

      if (attackResult.log) {
        logMessages.push(attackResult.log);

        if (totalDamage > 0) {
          tookAction = true;

          const attackerIds = battlefield.filter(c => c.attacking).map(c => c.id);
          setDeclaredAttackers(attackerIds);
          setBlockingPhase(true);

          setOpponentHand(hand);
          setOpponentLibrary(library);
          setOpponentBattlefield(battlefield);
          setGraveyard(prev => [...prev, ...graveyard]);
          setOpponentMana(mana);
          setOpponentPlayedLand(playedLand);
          setLog(prev => [...prev, ...logMessages]);
          setPlayerBattlefield(updatedPlayerBattlefield);

          return; // Wait for player blocks
        }
      }

      if (totalDamage > 0) {
        setPlayerLife(prev => Math.max(0, prev - totalDamage));
      }

      if (!tookAction) {
        logMessages.push(`🤖 Opponent takes no actions this turn.`);
      }

      setPlayerBattlefield(updatedPlayerBattlefield);
      setOpponentHand(hand);
      setOpponentLibrary(library);
      setOpponentBattlefield(battlefield);
      setGraveyard(prev => [...prev, ...graveyard]);
      setOpponentMana(mana);
      setOpponentPlayedLand(playedLand);
      setLog(prev => [...prev, ...logMessages]);
    } catch (err) {
      setLog(prev => [...prev, `🛑 CPU error: ${err.message}`]);
      console.error("🛑 CPU Turn Error:", err);
    }

    setTimeout(() => {
      onComplete();
    }, 300);
  }, 300);
}
