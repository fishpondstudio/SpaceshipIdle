import { clamp } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { type Addon, Addons } from "../definitions/Addons";
import type { BattleResult } from "../definitions/Galaxy";
import { ShipClassList } from "../definitions/ShipClass";
import type { GameState } from "../GameState";
import { addResource, getStat } from "./ResourceLogic";
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
   let totalAddons = 0;
   let differentAddons = 0;
   result.addons.forEach((count, addon) => {
      if (count > 0) {
         totalAddons += Math.round(count * getAddonFactor(addon, gs));
         ++differentAddons;
      }
   });
   if (totalAddons > 0) {
      const valueFromAddons = getBaseValue(totalAddons);
      value += valueFromAddons;
      breakdown.push({ label: "Add-ons", value: valueFromAddons });
   }
   if (differentAddons > 1) {
      const fromDifferentAddons = 10 * (differentAddons - 1);
      value += fromDifferentAddons;
      breakdown.push({ label: `${differentAddons} Different Add-ons`, value: fromDifferentAddons });
   }
   return [value, breakdown];
}

function getAddonFactor(Addon: Addon, gs: GameState): number {
   const shipClass = Addons[Addon].shipClass;
   const currentShipClass = getShipClass(gs);
   return 2 ** (ShipClassList.indexOf(shipClass) - ShipClassList.indexOf(currentShipClass));
}

export function getWarmongerPenalty(gs: GameState): number {
   return Math.ceil(getStat("Warmonger", gs.stats));
}

export function grantRewards(result: BattleResult, gs: GameState): void {
   const victoryPoint = result.resources.get("VictoryPoint");
   if (victoryPoint) {
      addResource("VictoryPoint", victoryPoint, gs.resources);
   }
   const xp = result.resources.get("XP");
   if (xp) {
      addResource("XP", xp, gs.resources);
   }
   const warp = result.resources.get("Warp");
   if (warp) {
      addResource("Warp", warp, gs.resources);
   }
}
