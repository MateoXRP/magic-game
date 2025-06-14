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
    gameOver,
  } = state;

  if (gameOver) return;

  setTimeout(() => {
    const logMessages = [];
    let hand = [...opponentHand];
    let library = [...opponentLibrary];
    let battlefield = [...opponentBattlefield];
    let graveyard = [];
    let mana = 0;
    let playedLand = false;
    let updatedPlayerBattlefield = [...playerBattlefield];
    let tookAction = false;
    let totalDamage = 0;

    try {
      logMessages.push(`🤖 Opponent's turn begins.`);
      logMessages.push(`🧠 Hand: ${hand.map(c => c.name).join(", ")}`);

      battlefield = untapBattlefield(battlefield);
      logMessages.push(`🔄 Untapped all battlefield cards.`);

      try {
        const drawResult = drawCard(library, hand);
        hand = drawResult.hand;
        library = drawResult.library;
        if (drawResult.log) logMessages.push(drawResult.log);
      } catch (err) {
        logMessages.push(`🛑 drawCard error: ${err.message}`);
      }

      try {
        const landResult = playLand(hand, battlefield);
        hand = landResult.hand;
        battlefield = landResult.battlefield;
        playedLand = landResult.playedLand;
        if (landResult.log) {
          logMessages.push(landResult.log);
          tookAction = true;
        }
      } catch (err) {
        logMessages.push(`🛑 playLand error: ${err.message}`);
      }

      try {
        const manaResult = generateMana(battlefield);
        battlefield = manaResult.battlefield;
        mana = manaResult.mana;
        logMessages.push(manaResult.log);
      } catch (err) {
        logMessages.push(`🛑 generateMana error: ${err.message}`);
      }

      try {
        const spellResult = castSpells(hand, battlefield, updatedPlayerBattlefield, mana);
        hand = spellResult.hand;
        battlefield = spellResult.battlefield;
        updatedPlayerBattlefield = spellResult.updatedPlayerBattlefield;
        graveyard = spellResult.graveyard;
        mana = spellResult.mana;
        spellResult.logs.forEach(msg => logMessages.push(msg));
        if (spellResult.logs.length > 0) tookAction = true;
      } catch (err) {
        logMessages.push(`🛑 castSpells error: ${err.message}`);
      }

      try {
        const summonResult = summonCreature(hand, battlefield, mana);
        hand = summonResult.hand;
        battlefield = summonResult.battlefield;
        mana = summonResult.mana;
        if (summonResult.log) {
          logMessages.push(summonResult.log);
          tookAction = true;
        }
      } catch (err) {
        logMessages.push(`🛑 summonCreature error: ${err.message}`);
      }

      try {
        const attackResult = declareAttackers(battlefield);
        battlefield = attackResult.battlefield;
        totalDamage = attackResult.totalDamage;
        if (attackResult.log) {
          logMessages.push(attackResult.log);
          if (totalDamage > 0) tookAction = true;
        }
      } catch (err) {
        logMessages.push(`🛑 declareAttackers error: ${err.message}`);
      }

      if (totalDamage > 0) {
        try {
          setPlayerLife(prev => Math.max(0, prev - totalDamage));
        } catch (err) {
          logMessages.push(`🛑 damage application error: ${err.message}`);
        }
      }

      if (!tookAction) {
        logMessages.push(`🤖 Opponent takes no actions this turn.`);
      }

      // ✅ State updates
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

    // ✅ End turn after short delay
    setTimeout(() => {
      onComplete();
    }, 300);
  }, 300);
}
