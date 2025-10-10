import { formatNumber, formatPercent, keysOf, shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import type { GameState } from "../GameState";
import { parseBuildingCode } from "../logic/BuildingLogic";
import type { Runtime } from "../logic/Runtime";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IAugmentDefinition {
   desc: (level: number, runtime: Runtime) => string;
   onTick: (level: number, runtime: Runtime) => void;
}

export const _Augments = {
   A1: {
      desc: (level: number, runtime: Runtime) => t(L.ReduceMinWarmonger, formatNumber(level)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.warmongerMin.add(-level, t(L.Augment));
      },
   },
   A2: {
      desc: (level: number, runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec * level),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec * level, t(L.Augment));
      },
   },
   A3: {
      desc: (level: number, runtime: Runtime) => t(L.PlusXExtraXPPerSec, formatPercent(0.05 * level)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.extraXPPerSecond.add(0.05 * level, t(L.Augment));
      },
   },
   A4: {
      desc: (level: number, runtime: Runtime) => t(L.PlusXVictoryPointPerHour, formatNumber(level * 2)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.victoryPointPerHour.add(level * 2, t(L.Augment));
      },
   },
   S1: {
      desc: (level: number, runtime: Runtime) => t(L.AllSeriesXWeaponsGetXPMultiplier, formatNumber(level), 1),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { series } = parseBuildingCode(data.type);
            if (rs && series === 1) {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
   S2: {
      desc: (level: number, runtime: Runtime) => t(L.AllSeriesXWeaponsGetXPMultiplier, formatNumber(level), 2),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { series } = parseBuildingCode(data.type);
            if (rs && series === 2) {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
   S3: {
      desc: (level: number, runtime: Runtime) => t(L.AllSeriesXWeaponsGetXPMultiplier, formatNumber(level), "30/50"),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { series } = parseBuildingCode(data.type);
            if (rs && (series === 30 || series === 50)) {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
   S4: {
      desc: (level: number, runtime: Runtime) => t(L.AllSeriesXWeaponsGetXPMultiplier, formatNumber(level), "76/100"),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { series } = parseBuildingCode(data.type);
            if (rs && (series === 76 || series === 100)) {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
   V1: {
      desc: (level: number, runtime: Runtime) =>
         t(L.AllVariantXWeaponsGetXPMultiplier, formatNumber(level), t(L.BaseVariant)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { variant } = parseBuildingCode(data.type);
            if (rs && !variant) {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
   V2: {
      desc: (level: number, runtime: Runtime) => t(L.AllVariantXWeaponsGetXPMultiplier, formatNumber(level), "A"),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { variant } = parseBuildingCode(data.type);
            if (rs && variant === "A") {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
   V3: {
      desc: (level: number, runtime: Runtime) => t(L.AllVariantXWeaponsGetXPMultiplier, formatNumber(level), "B"),
      onTick: (level: number, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const { variant } = parseBuildingCode(data.type);
            if (rs && variant === "B") {
               rs.xpMultiplier.add(level, t(L.Augment));
            }
         });
      },
   },
} as const satisfies Record<string, IAugmentDefinition>;

export type Augment = keyof typeof _Augments;
export const Augments: Record<Augment, IAugmentDefinition> = _Augments;

export function getAugments(gs: GameState): Augment[] {
   return shuffle(keysOf(Augments), srand(gs.seed));
}
