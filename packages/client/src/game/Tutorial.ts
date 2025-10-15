import { PlanetFlags, PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { type GameState, GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { getStat, resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import type { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import type { VideoTutorial } from "@spaceship-idle/shared/src/game/logic/VideoTutorials";
import { clamp, hasFlag, mReduceOf, numberToRoman } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import TutorialCopy from "../assets/videos/TutorialCopy.mp4?url";
import TutorialMove from "../assets/videos/TutorialMove.mp4?url";
import TutorialMultiselect from "../assets/videos/TutorialMultiselect.mp4?url";
import TutorialRecycle from "../assets/videos/TutorialRecycle.mp4?url";
import { G } from "../utils/Global";

export interface ITutorial {
   name: () => string;
   desc: () => string;
   progress: (gs: GameState, rt: Runtime) => [number, number];
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
      name: () => t(L.TutorialUpgradeXLevels, 20),
      desc: () => t(L.TutorialUpgradeXLevelsDescHTML),
      progress: (gs) => {
         let result = 0;
         for (const [tile, data] of gs.tiles) {
            result += clamp(data.level - 1, 0, Number.POSITIVE_INFINITY);
         }
         return [result, 20];
      },
   },
   {
      name: () => t(L.TutorialResearchXTech, 4),
      desc: () => t(L.TutorialResearch8TechDescHTML),
      progress: (gs) => {
         return [gs.unlockedTech.size, 4];
      },
   },
   {
      name: () => t(L.TutorialPickCatalyst, t(L.CatalystCatX, numberToRoman(1)!)),
      desc: () => t(L.TutorialPickCatalystDescHTML),
      progress: (gs) => {
         return [gs.selectedCatalysts.size, 1];
      },
   },
   {
      name: () => t(L.TutorialActivateCatalyst, t(L.CatalystCatX, numberToRoman(1)!)),
      desc: () => t(L.TutorialActivateCatalystDescHTML),
      progress: (gs, rt) => {
         return [
            mReduceOf(gs.selectedCatalysts, (prev, k, v) => prev + (rt.leftStat.isCatalystActivated(v) ? 1 : 0), 0),
            1,
         ];
      },
   },
   {
      name: () => t(L.TutorialDiscoverXElement, 1),
      desc: () => t(L.TutorialDiscover1ElementDescHTML),
      progress: (gs) => {
         return [getStat("Element", gs.stats), 1];
      },
   },
   {
      name: () => t(L.TutorialAssignElement, 1),
      desc: () => t(L.TutorialAssignElementDescHTML),
      progress: (gs) => {
         return [mReduceOf(gs.elements, (prev, k, v) => prev + (k === "H" ? v.amount : v.hp + v.damage), 0), 1];
      },
   },
   {
      name: () => t(L.TutorialUseTimeWarp),
      desc: () => t(L.TutorialUseTimeWarpDescHTML),
      progress: (gs) => {
         return [hasFlag(gs.flags, GameStateFlags.UsedWarp) ? 1 : 0, 1];
      },
   },
   {
      name: () => t(L.TutorialBuildXModules, 20),
      desc: () => t(L.TutorialBuild20ModulesDescHTML),
      progress: (gs) => {
         return [gs.tiles.size, 20];
      },
   },
   {
      name: () => t(L.TutorialBattleWithSpacePirate),
      desc: () => t(L.TutorialBattleWithSpacePirateDescHTML),
      progress: (gs, rt) => {
         const galaxy = rt.leftSave.data.galaxy;
         for (const starSystem of galaxy.starSystems) {
            for (const planet of starSystem.planets) {
               if (planet.type === PlanetType.Pirate && planet.battleResult) {
                  return [1, 1];
               }
            }
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialNegotiateWarReparation),
      desc: () => t(L.TutorialNegotiateWarReparationDescHTML),
      progress: (gs, rt) => {
         for (const [addon, data] of gs.addons) {
            if (data.amount > 0) {
               return [1, 1];
            }
         }
         if (resourceOf("VictoryPoint", gs.resources).total > 0) {
            return [1, 1];
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialEquipAddon),
      desc: () => t(L.TutorialEquipAddonDescHTML),
      progress: (gs, rt) => {
         for (const [addon, data] of gs.addons) {
            if (data.tile) {
               return [1, 1];
            }
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialDeclareFriendship),
      desc: () => t(L.TutorialDeclareFriendshipDescHTML),
      progress: (gs, rt) => {
         const galaxy = rt.leftSave.data.galaxy;
         for (const starSystem of galaxy.starSystems) {
            for (const planet of starSystem.planets) {
               if (hasFlag(planet.flags, PlanetFlags.WasFriends)) {
                  return [1, 1];
               }
            }
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialIssueSkiffClassDirective),
      desc: () => t(L.TutorialIssueSkiffClassDirectiveDescHTML),
      progress: (gs, rt) => {
         if (gs.selectedDirectives.has("Skiff")) {
            return [1, 1];
         }
         return [0, 1];
      },
   },
   {
      name: () => t(L.TutorialPrestigeAndUpgradePermanentElement),
      desc: () => t(L.TutorialPrestigeAndUpgradePermanentElementDescHTML),
      progress: (gs, rt) => {
         return [0, 1];
      },
   },
] as const;

export function getCurrentTutorial(): ITutorial | null {
   for (const t of Tutorial) {
      const [progress, total] = t.progress(G.save.state, G.runtime);
      if (progress < total) {
         return t;
      }
   }
   return null;
}

export const TutorialVideos: Record<VideoTutorial, string> = {
   Copy: TutorialCopy,
   Move: TutorialMove,
   Recycle: TutorialRecycle,
   Multiselect: TutorialMultiselect,
};
