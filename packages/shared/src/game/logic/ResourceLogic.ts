import { clamp, hasFlag, inverse } from "../../utils/Helper";
import { Config } from "../Config";
import type { GameState } from "../GameState";
import { BuildingFlag } from "../definitions/BuildingProps";
import { BattleQuantum, TrialQuantum } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import { getTotalBuildingValue } from "./BuildingLogic";
import type { RuntimeStat } from "./RuntimeStat";

export function resourceValueOf(resources: Map<Resource, number>): number {
   let result = 0;
   for (const [res, amount] of resources) {
      result += amount * (Config.Price.get(res) ?? 0);
   }
   return result;
}

export function resourceDiffOf(res: Resource, theoretical: boolean, stat: RuntimeStat): number {
   if (theoretical) {
      return (stat.theoreticalProduced.get(res) ?? 0) - (stat.theoreticalConsumed.get(res) ?? 0);
   }
   return stat.delta.get(res) ?? 0;
}

export const StartQuantum = 10;

export function getMaxSpaceshipValue(gs: GameState): number {
   return quantumToSpaceshipValue(getQuantumLimit(gs));
}

export function getQuantumLimit(gs: GameState): number {
   return getQuantumQualified(gs) + gs.trialCount * TrialQuantum;
}

export function getQuantumQualified(gs: GameState): number {
   return gs.battleCount * BattleQuantum + 30;
}

function getTotalXP(gs: GameState): number {
   return calcSpaceshipValue(gs) + (gs.resources.get("XP") ?? 0);
}

export function getCurrentQuantum(gs: GameState): number {
   return Math.min(spaceshipValueToQuantum(getTotalXP(gs)), getQuantumLimit(gs));
}

const qToSVLookup = new Map<number, number>();

function populateQuantumLookup() {
   if (qToSVLookup.size > 0) {
      return;
   }
   console.time("populateQuantumLookup");
   for (let q = 10_000; q >= 1; q--) {
      const sv = qToSV(q);
      qToSVLookup.set(q, sv);
   }
   console.timeEnd("populateQuantumLookup");
}

const shipValue = new Map<Resource, number>();
export function calcSpaceshipValue(gs: GameState): number {
   shipValue.clear();
   for (const [tile, data] of gs.tiles) {
      getTotalBuildingValue(data.type, 0, data.level, shipValue);
   }
   return resourceValueOf(shipValue);
}

export function spaceshipValueToQuantum(spaceshipValue: number): number {
   populateQuantumLookup();
   for (const [q, sv] of qToSVLookup) {
      if (spaceshipValue >= sv) {
         return clamp(q + StartQuantum, StartQuantum, Number.POSITIVE_INFINITY);
      }
   }
   return StartQuantum;
}

export function quantumToSpaceshipValue(quantum: number): number {
   populateQuantumLookup();
   if (quantum <= StartQuantum) {
      return 0;
   }
   return qToSVLookup.get(quantum - 10) ?? 0;
}

export function svToQ(sv: number): number {
   const t = Math.pow(Math.log(sv), 1 / 2) * 0.75;
   return Math.pow(sv / 100, 1 / t);
}

export function qToSV(quantum: number): number {
   return inverse(svToQ, quantum, 0, 1e30);
}

export function getUsedQuantum(gs: GameState): number {
   let result = 0;
   for (const [_, data] of gs.tiles) {
      if (hasFlag(Config.Buildings[data.type].buildingFlag, BuildingFlag.Booster)) {
         continue;
      }
      ++result;
   }
   return result + gs.unlockedTech.size;
}

export function getAvailableQuantum(gs: GameState): number {
   return getCurrentQuantum(gs) - getUsedQuantum(gs);
}

export function getNextQuantumProgress(gs: GameState): [number, number] {
   const sv = getTotalXP(gs);
   const q = spaceshipValueToQuantum(sv);
   const denominator = quantumToSpaceshipValue(q + 1) - quantumToSpaceshipValue(q);
   const progress = q >= getQuantumLimit(gs) ? 0 : (sv - quantumToSpaceshipValue(q)) / denominator;
   return [progress, denominator];
}
