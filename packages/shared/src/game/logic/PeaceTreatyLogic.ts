import { clamp } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { type Booster, Boosters } from "../definitions/Boosters";
import type { BattleResult } from "../definitions/Galaxy";
import { ShipClass } from "../definitions/TechDefinitions";
import type { GameState } from "../GameState";
import { getShipClass } from "./TechLogic";

export function getBaseValue(amount: number): number {
   return clamp((amount - 1) * 50, 0, Number.POSITIVE_INFINITY);
}

export interface Breakdown {
   label: string;
   value: number;
}

export function calculateRewardValue(result: BattleResult, gs: GameState): [number, Breakdown[]] {
   let value = 0;
   const breakdown: Breakdown[] = [];
   const vp = result.resources.get("VictoryPoint");
   if (vp) {
      const valueFromVictoryPoint = getBaseValue(vp);
      value += valueFromVictoryPoint;
      breakdown.push({ label: t(L.VictoryPoint), value: valueFromVictoryPoint });
   }
   let totalBoosters = 0;
   let differentBoosters = 0;
   result.boosters.forEach((count, booster) => {
      if (count > 0) {
         totalBoosters += Math.round(count * getBoosterFactor(booster, gs));
         ++differentBoosters;
      }
   });
   if (totalBoosters > 0) {
      const valueFromBoosters = getBaseValue(totalBoosters);
      value += valueFromBoosters;
      breakdown.push({ label: "Boosters", value: valueFromBoosters });
   }
   if (differentBoosters > 1) {
      const fromDifferentBoosters = 10 * (differentBoosters - 1);
      value += fromDifferentBoosters;
      breakdown.push({ label: `${differentBoosters} Different Boosters`, value: fromDifferentBoosters });
   }
   return [value, breakdown];
}

function getBoosterFactor(booster: Booster, gs: GameState): number {
   const shipClass = Boosters[booster].shipClass;
   const currentShipClass = getShipClass(gs);
   return 2 ** (ShipClass[shipClass].index - ShipClass[currentShipClass].index);
}
