import { Config } from "@spaceship-idle/shared/src/game/Config";
import { type Blueprint, Blueprints } from "@spaceship-idle/shared/src/game/definitions/Blueprints";
import type { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore, simulateBattle } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { rollElementShards } from "@spaceship-idle/shared/src/game/logic/PrestigeLogic";
import { changeStat, getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import type { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { getBuildingsWithinShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { enumOf, equal, INT32_MAX, randOne, round } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { jsonEncode } from "@spaceship-idle/shared/src/utils/Serialization";
import { RPCClient } from "../rpc/RPCClient";
import { BalancingModal } from "../ui/BalancingModal";
import { ChooseElementModal } from "../ui/ChooseElementModal";
import { NewPlayerModal } from "../ui/NewPlayerModal";
import { OfflineTimeModal } from "../ui/OfflineTimeModal";
import { PreBattleModal } from "../ui/PreBattleModal";
import { PrestigeModal } from "../ui/PrestigeModal";
import { PrestigeReason } from "../ui/PrestigeReason";
import { ViewShipModal } from "../ui/ViewShipModal";
import { idbClear } from "../utils/BrowserStorage";
import { G } from "../utils/Global";
import { hideModal, showModal } from "../utils/ToggleModal";
import { loadGameStateFromFile, loadSaveGameFromFile, saveGame } from "./LoadSave";
import { findShip } from "./Matchmaking";

export function addDebugFunctions(): void {
   if (!import.meta.env.DEV) return;
   // @ts-expect-error
   globalThis.G = G;
   // @ts-expect-error
   globalThis.Config = Config;
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
      gs.tiles = G.save.state.tiles;
      gs.unlockedTech = G.save.state.unlockedTech;
      console.log(jsonEncode(gs));
   };
   // @ts-expect-error
   globalThis.chooseElement = () => {
      changeStat("Element", -1, G.save.state.stats);
   };
   // @ts-expect-error
   globalThis.choosePermanentElement = () => {
      rollElementShards(G.save, 1);
      showModal({
         children: <ChooseElementModal permanent={true} choice={G.save.data.permanentElementChoices[0]} />,
         size: "xl",
      });
   };
   // @ts-expect-error
   globalThis.printFromFile = async () => {
      console.log(jsonEncode(await loadGameStateFromFile()));
   };
   // @ts-expect-error
   globalThis.printLayout = async () => {
      console.log(JSON.stringify(Array.from(G.save.state.tiles.keys())));
   };
   // @ts-expect-error
   globalThis.loadLayout = async (blueprint: Blueprint, shipClass: ShipClass) => {
      G.save.state.tiles.clear();
      const buildings = getBuildingsWithinShipClass(shipClass);
      Blueprints[blueprint].blueprint[shipClass].forEach((tile) => {
         G.save.state.tiles.set(tile, { type: randOne(buildings), level: 1 });
      });
   };
   // @ts-expect-error
   globalThis.balancing = async () => {
      showModal({
         children: <BalancingModal />,
         size: "lg",
         title: "Balancing",
         dismiss: true,
      });
   };
   // @ts-expect-error
   globalThis.loadGameState = async () => {
      G.save.state = await loadGameStateFromFile();
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
      const [score, hp, dps, rt] = calcShipScore(G.save.state);
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
   globalThis.offline = async () => {
      showModal({
         title: t(L.OfflineTime),
         children: <OfflineTimeModal offlineTime={G.save.state.offlineTime} />,
         size: "sm",
      });
   };
   // @ts-expect-error
   globalThis.reroll = async () => {
      changeStat("Element", -getStat("Element", G.save.state.stats), G.save.state.stats);
      G.save.data.elementChoices = [];
      G.save.state.elements.clear();
   };
   // @ts-expect-error
   globalThis.setLevel = (level: number) => {
      G.save.state.tiles.forEach((t) => {
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
         children: <PreBattleModal enemy={gs} info={{}} />,
         size: "lg",
         dismiss: true,
      });
   };

   const matchmake = async (): Promise<Runtime> => {
      const me = await RPCClient.findShipV3(0n, [0, INT32_MAX], [0, INT32_MAX], [0, INT32_MAX], [0, INT32_MAX]);
      const [score, hp, dps] = calcShipScore(me.json);
      const enemy = await findShip(score * 0.8, hp * 0.8, dps * 0.8);
      const [enemyScore, enemyHp, enemyDps] = calcShipScore(enemy.json);
      const now = performance.now();
      const rt = simulateBattle(me.json, enemy.json);
      if (!equal(enemyScore, enemy.score)) {
         console.error(`Score mismatch: Client: ${enemyScore} vs Server: ${enemy.score}`);
      }
      if (!equal(enemyHp, enemy.hp)) {
         console.error(`HP mismatch: Client: ${enemyHp} vs Server: ${enemy.hp}`);
      }
      if (!equal(enemyDps, enemy.dps)) {
         console.error(`DPS mismatch: Client: ${enemyDps} vs Server: ${enemy.dps}`);
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
         `*Opponent: ${enemy.shipId}\n`,
         `${rt.battleStatus === BattleStatus.LeftWin ? "👈" : "👉"} Result: ${enumOf(BattleStatus, rt.battleStatus)} (${Math.round(performance.now() - now)}ms)\n`,
         `${scoreMatch} Score: ${round(score, 2)} vs ${round(enemyScore, 2)}\n`,
         `${hpMatch} HP: ${round(hp, 2)} vs ${round(enemyHp, 2)}\n`,
         `${dpsMatch} DPS: ${round(dps, 2)} vs ${round(enemyDps, 2)}\n`,
      );
      // showModal({
      //    children: <MatchMakingModal key={Math.random()} enemy={ship.json} />,
      //    size: "lg",
      //    dismiss: true,
      // });
      return rt;
   };

   // @ts-expect-error
   globalThis.matchmake = matchmake;

   // @ts-expect-error
   globalThis.testMatchmake = async (count: number) => {
      let leftWin = 0;
      let rightWin = 0;
      for (let i = 0; i < count; i++) {
         const rt = await matchmake();
         if (rt.battleStatus === BattleStatus.RightWin) {
            rightWin++;
         } else {
            leftWin++;
         }
      }
      console.log(`Left Win: ${leftWin}, Right Win: ${rightWin}`);
   };
}
