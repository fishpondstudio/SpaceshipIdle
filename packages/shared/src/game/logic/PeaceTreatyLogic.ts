import { clamp, rollDice } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { type Addon, Addons } from "../definitions/Addons";
import type { BattleResult } from "../definitions/Galaxy";
import type { GameState } from "../GameState";
import { getVictoryType } from "./BattleLogic";
import { BattleVictoryTypeLabel } from "./BattleType";
import { addResource, getStat } from "./ResourceLogic";
import { getShipClass } from "./TechLogic";

export interface Breakdown {
   label: string;
   value: number;
   tooltip?: string;
}

export function calculateRewardValue(result: BattleResult, gs: GameState): [number, Breakdown[]] {
   let value = 0;
   const breakdown: Breakdown[] = [];
   const vp = result.resources.get("VictoryPoint");
   if (vp) {
      const valueFromVictoryPoint = (vp - 1) * 50;
      value += valueFromVictoryPoint;
      breakdown.push({ label: t(L.VictoryPoint), value: valueFromVictoryPoint });
   }
   let totalAddons = 0;
   let differentAddons = 0;
   let undiscoveredAddons = 0;
   let maxAddonFactor = 0;
   result.addons.forEach((count, addon) => {
      if (count > 0) {
         const addonFactor = getAddonFactor(addon, gs);
         maxAddonFactor = Math.max(maxAddonFactor, addonFactor);
         totalAddons += count * addonFactor;
         ++differentAddons;
         if ((gs.addons.get(addon)?.amount ?? 0) === 0) {
            ++undiscoveredAddons;
         }
      }
   });
   if (totalAddons > 0) {
      const valueFromAddons = Math.round((totalAddons - maxAddonFactor) * 50);
      value += valueFromAddons;
      breakdown.push({ label: t(L.Addons), value: valueFromAddons });
   }
   if (differentAddons > 1) {
      const fromDifferentAddons = 10 * (differentAddons - 1);
      value += fromDifferentAddons;
      breakdown.push({ label: t(L.XDifferentAddons, differentAddons), value: fromDifferentAddons });
   }
   if (undiscoveredAddons > 0) {
      const fromUndiscoveredAddons = 10 * undiscoveredAddons;
      value += fromUndiscoveredAddons;
      breakdown.push({ label: t(L.XUndiscoveredAddons, undiscoveredAddons), value: fromUndiscoveredAddons });
   }
   return [value, breakdown];
}

function getAddonFactor(Addon: Addon, gs: GameState): number {
   const shipClass = Addons[Addon].shipClass;
   const currentShipClass = getShipClass(gs);
   // return 2 ** (ShipClassList.indexOf(shipClass) - ShipClassList.indexOf(currentShipClass));
   if (shipClass === currentShipClass) {
      return 1;
   }
   return 0.8;
}

export function getWarmongerPenalty(gs: GameState): number {
   return Math.ceil(clamp(getStat("Warmonger", gs.stats), 0, Number.POSITIVE_INFINITY));
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

export interface PeaceTreatyScoreBreakdown {
   label: string;
   value: number | number[];
   tooltip?: string;
   className?: string;
}

export function getPeaceTreatyScore(
   battleScore: number,
   gs: GameState,
   random: () => number,
): [number, PeaceTreatyScoreBreakdown[]] {
   if (battleScore <= 0) {
      return [0, [{ label: BattleVictoryTypeLabel[getVictoryType(battleScore)](), value: 0 }]];
   }

   const breakdown: PeaceTreatyScoreBreakdown[] = [];
   breakdown.push({ label: BattleVictoryTypeLabel[getVictoryType(battleScore)](), value: battleScore });

   const winningStreak = getStat("WinningStreak", gs.stats);
   const winningStreakScore = getWinningStreakScore(winningStreak);
   if (winningStreakScore > 0) {
      breakdown.push({
         label: `${t(L.WinningStreak)} (x${winningStreak})`,
         value: winningStreakScore,
         tooltip: t(L.WinningStreakTooltipHTML),
      });
   }
   if (gs.blueprint === "Intrepid") {
      breakdown.push({
         label: t(L.SpaceshipPrefix, t(L.Intrepid)),
         value: [rollDice(6, random), rollDice(6, random)],
      });
   }

   const peaceTreatyScore = breakdown.reduce((acc, b) => {
      return acc + (typeof b.value === "number" ? b.value : b.value.reduce((acc, v) => acc + v, 0));
   }, 0);

   if (peaceTreatyScore > 100) {
      breakdown.push({
         label: t(L.ScoreCappedAt100),
         value: [],
         className: "text-red",
      });
   }

   return [Math.min(peaceTreatyScore, 100), breakdown];
}

function getWinningStreakScore(ws: number): number {
   return Math.min((ws - 1) * 1, 10);
}
