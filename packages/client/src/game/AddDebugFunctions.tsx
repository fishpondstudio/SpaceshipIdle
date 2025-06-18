import { Config } from "@spaceship-idle/shared/src/game/Config";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, hashGameState } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore, simulateBattle } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { rollElementShards } from "@spaceship-idle/shared/src/game/logic/PrestigeLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { randomColor } from "@spaceship-idle/shared/src/thirdparty/RandomColor";
import { enumOf, equal, forEach, INT32_MAX, round } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { jsonEncode } from "@spaceship-idle/shared/src/utils/Serialization";
import { RPCClient } from "../rpc/RPCClient";
import { BattleResultVictoryModal } from "../ui/BattleResultVictoryModal";
import { ChooseElementModal } from "../ui/ChooseElementModal";
import { MatchMakingModal } from "../ui/MatchmakingModal";
import { NewPlayerModal } from "../ui/NewPlayerModal";
import { OfflineTimeModal } from "../ui/OfflineTimeModal";
import { PracticeBattleResultModal } from "../ui/PracticeBattleResultModal";
import { PrestigeModal } from "../ui/PrestigeModal";
import { PrestigeReason } from "../ui/PrestigeReason";
import { QuantumProgressModal } from "../ui/QuantumProgressModal";
import { SecondChanceBattleResultModal } from "../ui/SecondChanceBattleResultModal";
import { ViewShipModal } from "../ui/ViewShipModal";
import { idbClear } from "../utils/BrowserStorage";
import { G } from "../utils/Global";
import { hideModal, showModal } from "../utils/ToggleModal";
import { loadGameStateFromFile, loadSaveGameFromFile, saveGame } from "./LoadSave";

export function addDebugFunctions(): void {
   if (!import.meta.env.DEV) return;
   // @ts-expect-error
   globalThis.G = G;
   // @ts-expect-error
   globalThis.Config = Config;
   // @ts-expect-error
   globalThis.randColor = () => {
      forEach(Config.Buildings, (b, def) => {
         G.save.options.buildingColors.set(b, randomColor());
      });
      GameOptionUpdated.emit();
   };
   // @ts-expect-error
   globalThis.reset = async () => {
      await idbClear();
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.save = async () => {
      await saveGame(G.save);
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.exportShip = async () => {
      const gs = new GameState();
      gs.tiles = G.save.current.tiles;
      gs.unlockedTech = G.save.current.unlockedTech;
      console.log(jsonEncode(gs));
   };
   // @ts-expect-error
   globalThis.chooseElement = () => {
      G.save.current.discoveredElements--;
   };
   // @ts-expect-error
   globalThis.choosePermanentElement = () => {
      rollElementShards(G.save, 1);
      showModal({
         children: <ChooseElementModal permanent={true} choice={G.save.options.elementChoices[0]} />,
         size: "xl",
      });
   };
   // @ts-expect-error
   globalThis.printFromFile = async () => {
      console.log(jsonEncode(await loadGameStateFromFile()));
   };
   // @ts-expect-error
   globalThis.loadGameState = async () => {
      G.save.current = await loadGameStateFromFile();
      await saveGame(G.save);
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.loadSaveGame = async () => {
      G.save = await loadSaveGameFromFile();
      await saveGame(G.save);
      window.location.reload();
   };
   // @ts-expect-error
   globalThis.calcScore = () => {
      console.time("calcScore");
      const [score, hp, dps, rt] = calcShipScore(G.save.current);
      console.log(`Score = ${score}, HP = ${hp}, DPS = ${dps}, rt = ${rt}`);
      console.timeEnd("calcScore");
   };
   // @ts-expect-error
   globalThis.prestige = async () => {
      G.runtime.battleStatus = BattleStatus.RightWin;
      showModal({
         children: <PrestigeModal reason={PrestigeReason.Incompatible} />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.defeated = async () => {
      showModal({
         children: <PrestigeModal reason={PrestigeReason.Defeated} />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.victory = async () => {
      showModal({
         children: <BattleResultVictoryModal />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.secondChance = async () => {
      showModal({
         children: <SecondChanceBattleResultModal />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.practice = async () => {
      showModal({
         children: <PracticeBattleResultModal />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.offline = async () => {
      showModal({
         title: t(L.OfflineTime),
         children: <OfflineTimeModal offlineTime={G.save.current.offlineTime} />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.progress = async () => {
      showModal({
         title: t(L.QuantumProgress),
         children: <QuantumProgressModal />,
         size: "lg",
         dismiss: true,
      });
   };
   // @ts-expect-error
   globalThis.reroll = async () => {
      G.save.current.discoveredElements = 0;
      G.save.current.elementChoices = [];
      G.save.current.elements.clear();
   };
   // @ts-expect-error
   globalThis.setLevel = (level: number) => {
      G.save.current.tiles.forEach((t) => {
         t.level = level;
      });
   };
   // @ts-expect-error
   globalThis.newPlayer = async () => {
      showModal({
         children: <NewPlayerModal />,
         size: "lg",
         title: t(L.WelcomeToSpaceshipIdle),
         dismiss: false,
      });
   };
   // @ts-expect-error
   globalThis.hideModal = hideModal;
   // @ts-expect-error
   globalThis.viewShip = (id: string) => {
      showModal({
         title: t(L.ViewShip),
         children: <ViewShipModal id={id} />,
         size: "md",
         dismiss: true,
      });
   };
   // @ts-expect-error
   globalThis.battle = async () => {
      const gs = await loadGameStateFromFile();
      showModal({
         children: <MatchMakingModal enemy={gs} />,
         size: "lg",
         dismiss: true,
      });
   };
   // @ts-expect-error
   globalThis.matchmake = async () => {
      const me = await RPCClient.findShipV3(0n, [0, INT32_MAX], [0, INT32_MAX]);
      G.save.current = me.json;
      G.runtime = new Runtime(G.save, new GameState());
      G.runtime.battleType = BattleType.Peace;
      G.runtime.createEnemy();

      const [score, hp, dps] = calcShipScore(G.save.current);
      const ship = await RPCClient.findShipV3(hashGameState(G.save.current), [0, me.quantum], [score / 1.1, score]);
      const [enemyScore, enemyHp, enemyDps] = calcShipScore(ship.json);
      const now = performance.now();
      const rt = simulateBattle(G.save.current, ship.json);
      if (!equal(enemyScore, ship.score)) {
         console.error(`Score mismatch: Client: ${enemyScore} vs Server: ${ship.score}`);
      }

      let scoreMatch = "❌";
      let hpMatch = "❌";
      let dpsMatch = "❌";
      if (rt.battleStatus === BattleStatus.LeftWin) {
         if (score > enemyScore) {
            scoreMatch = "✅";
         }
         if (hp > enemyHp) {
            hpMatch = "✅";
         }
         if (dps > enemyDps) {
            dpsMatch = "✅";
         }
      }
      if (rt.battleStatus === BattleStatus.RightWin) {
         if (score < enemyScore) {
            scoreMatch = "✅";
         }
         if (hp < enemyHp) {
            hpMatch = "✅";
         }
         if (dps < enemyDps) {
            dpsMatch = "✅";
         }
      }

      console.log(
         `*Opponent: ${ship.shipId}\n`,
         `${rt.battleStatus === BattleStatus.LeftWin ? "👈" : "👉"} Result: ${enumOf(BattleStatus, rt.battleStatus)} (${Math.round(performance.now() - now)}ms)\n`,
         `${scoreMatch} Score: ${round(score, 2)} vs ${round(enemyScore, 2)}\n`,
         `${hpMatch} HP: ${round(hp, 2)} vs ${round(enemyHp, 2)}\n`,
         `${dpsMatch} DPS: ${round(dps, 2)} vs ${round(enemyDps, 2)}\n`,
      );
      showModal({
         children: <MatchMakingModal enemy={ship.json} />,
         size: "lg",
         dismiss: true,
      });
   };
}
