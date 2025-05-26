import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import {
   calcSpaceshipValue,
   getUsedQuantum,
   quantumToSpaceshipValue,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatNumber, mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export interface ITutorial {
   name: () => string;
   desc?: () => string;
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
      name: () => t(L.TutorialUseXQuantum, 25),
      desc: () => t(L.TutorialUse25QuantumDescHTML),
      progress: (gs) => {
         return [getUsedQuantum(gs), 25];
      },
   },
   {
      name: () => t(L.TutorialReachXSpaceshipXP, formatNumber(quantumToSpaceshipValue(30) * 0.9)),
      desc: () => t(L.TutorialReach260SpaceshipXPDescHTML),
      progress: (gs) => {
         return [calcSpaceshipValue(gs), quantumToSpaceshipValue(30) * 0.9];
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
