import { forEach, hasFlag, mapOf, mapSafeAdd, sizeOf } from "../../utils/Helper";
import { Config } from "../Config";
import { AbilityRangeLabel } from "../definitions/Ability";
import { BuildingFlag, type IBoosterDefinition, WeaponKey } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import type { Resource } from "../definitions/Resource";
import type { GameState } from "../GameState";
import type { ITileData } from "../ITileData";
import { calcSpaceshipValue, getMaxSpaceshipValue, resourceValueOf } from "./ResourceLogic";

export function getNextLevel(currentLevel: number, x: number): number {
   return (Math.floor(currentLevel / x) + 1) * x;
}

export function fib(n: number): number {
   let a = 0;
   let b = 1;
   let c = 1;
   for (let i = 0; i <= n; ++i) {
      c = a + b;
      a = b;
      b = c;
   }
   return a;
}

export function getBuildingValue(
   building: Building,
   level: number,
   result: Map<Resource, number> | null = null,
): Map<Resource, number> {
   result ??= new Map<Resource, number>();
   const def = Config.Buildings[building];
   if (hasFlag(def.buildingFlag, BuildingFlag.Booster)) {
      return result;
   }
   forEach(def.output, (res, value) => {
      mapSafeAdd(result, res, value * fib(level));
   });
   let xp = 0;
   result.forEach((value, res) => {
      let price = Config.Price.get(res) ?? 0;
      price = price <= 0 ? 1 : price;
      xp += value * price;
   });
   result.clear();
   result.set("XP", xp);
   return result;
}

export function getTotalBuildingValue(
   building: Building,
   currentLevel: number,
   targetLevel: number,
   result: Map<Resource, number> | null = null,
): Map<Resource, number> {
   const min = Math.min(currentLevel, targetLevel);
   const max = Math.max(currentLevel, targetLevel);
   result ??= new Map<Resource, number>();
   for (let level = min + 1; level <= max; ++level) {
      getBuildingValue(building, level, result);
   }
   return result;
}

export function upgradeMax(tile: ITileData, gs: GameState): void {
   const def = Config.Buildings[tile.type];
   let resources = getBuildingValue(tile.type, tile.level + 1);
   while (resourceValueOf(resources) < getMaxSpaceshipValue(gs) && trySpend(resources, gs)) {
      tile.level++;
      resources = getBuildingValue(tile.type, tile.level + 1);
   }
}

export function canSpend(resources: Map<Resource, number>, gs: GameState): boolean {
   return (
      hasEnoughResources(resources, gs.resources) &&
      calcSpaceshipValue(gs) + resourceValueOf(resources) < getMaxSpaceshipValue(gs)
   );
}

export function trySpend(resources: Map<Resource, number>, gs: GameState): boolean {
   if (!canSpend(resources, gs)) {
      return false;
   }
   return tryDeductResources(resources, gs.resources);
}

export function hasEnoughResources(required: Map<Resource, number>, resources: Map<Resource, number>): boolean {
   for (const [res, value] of required) {
      const current = resources.get(res);
      if (current === undefined || current < value) {
         return false;
      }
   }
   return true;
}

export function tryDeductResources(required: Map<Resource, number>, resources: Map<Resource, number>): boolean {
   if (!hasEnoughResources(required, resources)) {
      return false;
   }
   for (const [res, value] of required) {
      mapSafeAdd(resources, res, -value);
   }
   return true;
}

export function getUnlockedBuildings(gs: GameState): Building[] {
   return Array.from(gs.unlockedTech).flatMap((t) => Config.Tech[t].unlockBuildings ?? []);
}

export function getBuildingDesc(building: Building): string {
   const def = Config.Buildings[building];
   if (hasFlag(def.buildingFlag, BuildingFlag.Booster)) {
      const booster = def as IBoosterDefinition;
      return `${booster.desc()} (${AbilityRangeLabel[booster.range]()})`;
   }
   let left = "";
   let right = "";
   if ("output" in def) {
      right = mapOf(def.output, (res, value) => `${value} ${Config.Resources[res].name()}`).join(" + ");
   }
   if ("input" in def) {
      left = mapOf(def.input, (res, value) => `${value} ${Config.Resources[res].name()}`).join(" + ");
   }
   return `${left} -> ${right}`;
}

export function damageToHp(damage: number, building: Building): number {
   const def = Config.Buildings[building];
   if (hasFlag(def.buildingFlag, BuildingFlag.Booster)) {
      return (damage / 10000) * 20;
   }
   if (WeaponKey in def) {
      return damage * 10;
   }
   return damage * 100;
}

export function boosterHpToUnlockCost(hp: number, building: Building): Map<Resource, number> {
   const def = Config.Buildings[building];
   if (!hasFlag(def.buildingFlag, BuildingFlag.Booster)) {
      throw new Error("Building is not a Booster");
   }
   const damage = (hp * 10000) / 20;
   const booster = def as IBoosterDefinition;
   const perResource = damage / sizeOf(booster.unlock);
   const result = new Map<Resource, number>();
   forEach(booster.unlock, (k, v) => {
      result.set(k, perResource / (Config.NormalizedPrice.get(k) ?? 0));
   });
   return result;
}

export function hasConstructed(building: Building, gs: GameState): boolean {
   for (const [tile, data] of gs.tiles) {
      if (data.type === building) {
         return true;
      }
   }
   return false;
}

export function getBoosterCount(gs: GameState): number {
   let result = 0;
   for (const [_, data] of gs.tiles) {
      if (hasFlag(Config.Buildings[data.type].buildingFlag, BuildingFlag.Booster)) {
         result++;
      }
   }
   return result;
}
