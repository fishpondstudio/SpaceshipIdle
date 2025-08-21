import { clamp, inverse } from "../../utils/Helper";
import type { Resource } from "../definitions/Resource";
import type { GameState, ResourceData, ResourceDataPersisted } from "../GameState";
import { getTotalBuildingCost } from "./BuildingLogic";
import { getShipBlueprint } from "./ShipLogic";

export function resourceValueOf(resources: Map<Resource, ResourceDataPersisted>): number {
   let result = 0;
   for (const [res, amount] of resources) {
      result += amount.total - amount.used;
   }
   return result;
}

export function resourceOf(resource: Resource, resources: Map<Resource, ResourceDataPersisted>): ResourceData {
   const result: ResourceDataPersisted = resources.get(resource) ?? { total: 0, used: 0 };
   return { current: result.total - result.used, total: result.total, used: result.used };
}

export function addResource(resource: Resource, amount: number, resources: Map<Resource, ResourceDataPersisted>): void {
   const result: ResourceDataPersisted = resources.get(resource) ?? { total: 0, used: 0 };
   console.assert(amount >= 0);
   result.total += amount;
   resources.set(resource, result);
}

export function spendResource(
   resource: Resource,
   amount: number,
   resources: Map<Resource, ResourceDataPersisted>,
): void {
   const result: ResourceDataPersisted = resources.get(resource) ?? { total: 0, used: 0 };
   console.assert(amount >= 0);
   result.used += amount;
   resources.set(resource, result);
}

export function canSpendResource(
   resource: Resource,
   amount: number,
   resources: Map<Resource, ResourceDataPersisted>,
): boolean {
   const result: ResourceDataPersisted = resources.get(resource) ?? { total: 0, used: 0 };
   return result.total - result.used >= amount;
}

export function trySpendResource(
   resource: Resource,
   amount: number,
   resources: Map<Resource, ResourceDataPersisted>,
): boolean {
   const result: ResourceDataPersisted = resources.get(resource) ?? { total: 0, used: 0 };
   console.assert(amount >= 0);
   if (result.total - result.used >= amount) {
      result.used += amount;
      resources.set(resource, result);
      return true;
   }
   return false;
}

export function refundResource(
   resource: Resource,
   amount: number,
   resources: Map<Resource, ResourceDataPersisted>,
): void {
   const result = resources.get(resource) ?? { current: 0, total: 0, used: 0 };
   console.assert(amount >= 0);
   console.assert(result.used >= amount);
   result.used -= amount;
   resources.set(resource, result);
}

export const StartQuantum = 10;

export function getTotalQuantum(gs: GameState): number {
   return xpToQuantum(resourceOf("XP", gs.resources).total);
}

export function getMinimumQuantumForBattle(gs: GameState): number {
   const bp = getShipBlueprint(gs);
   return bp.length;
}
export function getMinimumSpaceshipXPForBattle(gs: GameState): number {
   return quantumToXP(getMinimumQuantumForBattle(gs));
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

export function calcSpaceshipXP(gs: GameState): number {
   let result = 0;
   for (const [tile, data] of gs.tiles) {
      result += getTotalBuildingCost(data.type, 0, data.level);
   }
   return result;
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
   return quantum ** t * 10;
}

export function getUsedQuantum(gs: GameState): number {
   return gs.tiles.size + gs.unlockedTech.size;
}

export function getAvailableQuantum(gs: GameState): number {
   return getTotalQuantum(gs) - getUsedQuantum(gs);
}
