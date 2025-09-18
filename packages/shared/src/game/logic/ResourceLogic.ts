import { L, t } from "../../utils/i18n";
import type { IHaveXY } from "../../utils/Vector2";
import { BaseTimeWarpHour } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import type { Stat } from "../definitions/Stat";
import type { GameState, ResourceData, ResourceDataPersisted } from "../GameState";
import { getTotalBuildingCost } from "./BuildingLogic";
import type { Breakdown } from "./PeaceTreatyLogic";
import { RequestParticle } from "./RequestParticle";

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

export function addResource(
   resource: Resource,
   amount: number,
   resources: Map<Resource, ResourceDataPersisted>,
   from?: IHaveXY,
): void {
   const result: ResourceDataPersisted = resources.get(resource) ?? { total: 0, used: 0 };
   console.assert(amount >= 0, `addResource: amount is negative. resource: ${resource}, amount: ${amount}`);
   result.total += amount;
   resources.set(resource, result);
   if (from) {
      RequestParticle.emit({ from, resource, amount });
   }
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

export function canSpendResources(
   resources: Partial<Record<Resource, number>>,
   inventory: Map<Resource, ResourceDataPersisted>,
): boolean {
   let resource: Resource;
   for (resource in resources) {
      if (!canSpendResource(resource, resources[resource]!, inventory)) {
         return false;
      }
   }
   return true;
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

export function trySpendResources(
   resources: Partial<Record<Resource, number>>,
   inventory: Map<Resource, ResourceDataPersisted>,
): boolean {
   if (!canSpendResources(resources, inventory)) {
      return false;
   }
   let resource: Resource;
   for (resource in resources) {
      trySpendResource(resource, resources[resource]!, inventory);
   }
   return true;
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

export function changeStat(stat: Stat, amount: number, stats: Map<Stat, number>): number {
   const result = (stats.get(stat) ?? 0) + amount;
   stats.set(stat, result);
   return result;
}

export function getStat(stat: Stat, stats: Map<Stat, number>): number {
   return stats.get(stat) ?? 0;
}

export function calcSpaceshipXP(gs: GameState): number {
   let result = 0;
   for (const [tile, data] of gs.tiles) {
      result += getTotalBuildingCost(data.type, 0, data.level);
   }
   return result;
}

export function getMaxTimeWarp(gs: GameState): [number, Breakdown[]] {
   const result: Breakdown[] = [{ label: t(L.BaseValue), value: BaseTimeWarpHour }];
   const element = gs.elements.get("H");
   if (element) {
      result.push({ label: t(L.ElementAmountThisRun, "H"), value: element.amount });
   }
   const permanent = gs.permanentElements.get("H");
   if (permanent) {
      result.push({ label: t(L.ElementPermanent, "H"), value: permanent.amount });
   }
   return [result.reduce((a, b) => a + b.value, 0), result];
}
