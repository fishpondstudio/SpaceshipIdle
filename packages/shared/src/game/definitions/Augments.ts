import { cast, formatNumber, formatPercent, keysOf, shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import type { GameState } from "../GameState";
import type { Runtime } from "../logic/Runtime";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IAugmentDefinition {
   desc: (level: number, runtime: Runtime) => string;
   onTick: (level: number, runtime: Runtime) => void;
}

export const Augments = {
   A1: cast<IAugmentDefinition>({
      desc: (level: number, runtime: Runtime) => t(L.ReduceMinWarmonger, formatNumber(level)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.warmongerMin.add(-level, t(L.Augment));
      },
   }),
   A2: cast<IAugmentDefinition>({
      desc: (level: number, runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec * level),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec * level, t(L.Augment));
      },
   }),
   A3: cast<IAugmentDefinition>({
      desc: (level: number, runtime: Runtime) => t(L.PlusXExtraXPPerSec, formatPercent(0.05 * level)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.extraXPPerSecond.add(0.05 * level, t(L.Augment));
      },
   }),
   A4: cast<IAugmentDefinition>({
      desc: (level: number, runtime: Runtime) => t(L.PlusXVictoryPointPerHour, formatNumber(level * 2)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.victoryPointPerHour.add(level * 2, t(L.Augment));
      },
   }),
} as const satisfies Record<string, IAugmentDefinition>;

export type Augment = keyof typeof Augments;

export function getAugments(gs: GameState): Augment[] {
   return shuffle(keysOf(Augments), srand(gs.seed));
}
