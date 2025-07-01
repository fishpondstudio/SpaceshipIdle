import { DefaultPriority, QualifierSpaceshipValuePercent } from "@spaceship-idle/shared/src/game/definitions/Constant";
import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { getBoosterCount } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { calcSpaceshipXP, getUsedQuantum, quantumToXP } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { clamp, formatNumber, mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export interface ITutorial {
   name: () => string;
   desc: () => string;
   progress: (gs: GameState) => [number, number];
}

export const Tutorial: ITutorial[] = [
   {
      name: () => t(L.TutorialBuildXModules, 6),
      desc: () => t(L.TutorialBuild6ModulesDescHTML),
      progress: (gs) => {
         return [gs.tiles.size, 6];
      },
   },
   {
      name: () => t(L.TutorialUpgradeXLevels, 30),
      desc: () => t(L.TutorialUpgradeXLevelsDescHTML),
      progress: (gs) => {
         let result = 0;
         for (const [tile, data] of gs.tiles) {
            result += clamp(data.level - 1, 0, Number.POSITIVE_INFINITY);
         }
         return [result, 30];
      },
   },
   {
      name: () => t(L.TutorialResearchXTech, 8),
      desc: () => t(L.TutorialResearch8TechDescHTML),
      progress: (gs) => {
         return [gs.unlockedTech.size, 8];
      },
   },
   {
      name: () => t(L.TutorialDiscoverXElement, 1),
      desc: () => t(L.TutorialDiscover1ElementDescHTML),
      progress: (gs) => {
         return [mReduceOf(gs.elements, (prev, k, v) => prev + v, 0), 1];
      },
   },
   {
      name: () => t(L.TutorialProductionPriority),
      desc: () => t(L.TutorialProductionPriorityDescHTML),
      progress: (gs) => {
         for (const [tile, data] of gs.tiles) {
            if (data.priority !== DefaultPriority) {
               return [1, 1];
            }
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialProductionCapacity),
      desc: () => t(L.TutorialProductionCapacityDescHTML),
      progress: (gs) => {
         for (const [tile, data] of gs.tiles) {
            if (data.capacity < 1) {
               return [1, 1];
            }
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialUseXQuantum, 25),
      desc: () => t(L.TutorialUse25QuantumDescHTML),
      progress: (gs) => {
         return [getUsedQuantum(gs), 25];
      },
   },
   {
      name: () => t(L.TutorialReachXSpaceshipXP, formatNumber(quantumToXP(30) * QualifierSpaceshipValuePercent)),
      desc: () => t(L.TutorialReach260SpaceshipXPDescHTML),
      progress: (gs) => {
         return [calcSpaceshipXP(gs), quantumToXP(30) * QualifierSpaceshipValuePercent];
      },
   },
   {
      name: () => t(L.TutorialWinSpaceshipBattle, 1),
      desc: () => t(L.TutorialWinSpaceshipBattleDescHTMLV2),
      progress: (gs) => {
         return [gs.win, 1];
      },
   },
   {
      name: () => t(L.TutorialBuildXBoosters, 1),
      desc: () => t(L.TutorialBuild1BoosterDescHTML),
      progress: (gs) => {
         return [getBoosterCount(gs), 1];
      },
   },
] as const;

export function getCurrentTutorial(): ITutorial | null {
   for (const t of Tutorial) {
      const [progress, total] = t.progress(G.save.current);
      if (progress < total) {
         return t;
      }
   }
   return null;
}
