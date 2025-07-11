import { clamp, forEach, inverse } from "../../utils/Helper";
import { Config } from "../Config";
import type { GameState } from "../GameState";
import { BattleLossQuantum, BattleWinQuantum } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import { getTotalBuildingValue, isBooster } from "./BuildingLogic";
import { getTotalElementLevels } from "./ElementLogic";
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

export function getMaxSpaceshipXP(gs: GameState): number {
   return quantumToXP(getQualifiedQuantum(gs));
}

export function getQualifiedQuantum(gs: GameState): number {
   return 30 + gs.win * BattleWinQuantum + gs.loss * BattleLossQuantum + getQuantumFromPermanentElement(gs);
}

export function getQuantumFromPermanentElement(gs: GameState): number {
   return Math.floor(getTotalElementLevels(gs) / 10) * 5;
}

const qToSVLookup = new Map<number, number>();

function populateQuantumLookup() {
   if (qToSVLookup.size > 0) {
      return;
   }
   for (let q = 10_000; q >= 1; q--) {
      const sv = qToSV(q);
      qToSVLookup.set(q, sv);
   }
}

const shipValue = new Map<Resource, number>();
export function calcSpaceshipXP(gs: GameState): number {
   shipValue.clear();
   for (const [tile, data] of gs.tiles) {
      getTotalBuildingValue(data.type, 0, data.level, shipValue);
   }
   return resourceValueOf(shipValue);
}

export function xpToQuantum(spaceshipValue: number): number {
   populateQuantumLookup();
   for (const [q, sv] of qToSVLookup) {
      if (spaceshipValue >= sv) {
         return clamp(q + StartQuantum, StartQuantum, Number.POSITIVE_INFINITY);
      }
   }
   return StartQuantum;
}

export function quantumToXP(quantum: number): number {
   populateQuantumLookup();
   if (quantum <= StartQuantum) {
      return 0;
   }
   return qToSVLookup.get(quantum - 10) ?? 0;
}

export function svToQ(sv: number): number {
   return inverse(qToSV, sv, 0, 1e30);
}

export function qToSV(quantum: number): number {
   const t = Math.log(clamp(quantum, 30, Number.POSITIVE_INFINITY));
   return Math.pow(quantum, t) * 10;
}

export function getUsedQuantum(gs: GameState): number {
   let result = 0;
   for (const [_, data] of gs.tiles) {
      if (isBooster(data.type)) {
         continue;
      }
      ++result;
   }
   return result + gs.unlockedTech.size;
}

export function getAvailableQuantum(gs: GameState): number {
   return getQualifiedQuantum(gs) - getUsedQuantum(gs);
}

export function getResourceUsed(gs: GameState): Set<Resource> {
   const result = new Set<Resource>();
   for (const [_, data] of gs.tiles) {
      const def = Config.Buildings[data.type];
      forEach(def.input, (res, amount) => {
         result.add(res);
      });
      forEach(def.output, (res, amount) => {
         result.add(res);
      });
   }
   return result;
}
