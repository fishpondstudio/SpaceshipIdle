import { forEach, formatNumber, hasFlag, mapOf, mapSafeAdd, sizeOf } from "../../utils/Helper";
import { Config, priceMultiplier } from "../Config";
import { AbilityRangeLabel } from "../definitions/Ability";
import { BuildingFlag, type IBoosterDefinition, WeaponKey } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { MaxBuildingCount } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import type { GameState, Tiles } from "../GameState";
import type { ITileData } from "../ITileData";
import { calcSpaceshipXP, getMaxSpaceshipXP, resourceValueOf } from "./ResourceLogic";

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

export function hashBuildingAndLevel(building: Building, level: number): number {
   return level * MaxBuildingCount + Config.BuildingId[building];
}

const buildingValueCache = new Map<number, number>();
export function getBuildingValue(
   building: Building,
   level: number,
   result: Map<Resource, number> | null = null,
): Map<Resource, number> {
   result ??= new Map<Resource, number>();
   const def = Config.Buildings[building];
   if (isBooster(building)) {
      return result;
   }
   const hash = hashBuildingAndLevel(building, level);
   const cached = buildingValueCache.get(hash);
   if (cached !== undefined) {
      mapSafeAdd(result, "XP", cached);
      return result;
   }

   let xp = 0;
   forEach(def.output, (res, value) => {
      xp += (Config.Price.get(res) ?? 0) * value * fib(level);
   });

   if (xp <= 0) {
      const inputSize = sizeOf(def.input);
      forEach(def.input, (res, value) => {
         xp += (Config.Price.get(res) ?? 0) * value * fib(level) * priceMultiplier(inputSize);
      });
   }

   if (xp <= 0) {
      xp = fib(level);
   }

   mapSafeAdd(result, "XP", xp);
   buildingValueCache.set(hash, xp);
   return result;
}

export function getNormalizedValue(data: { type: Building; level: number }): number {
   const def = Config.Buildings[data.type];
   let value = 0;
   if (isBooster(data.type)) {
      const booster = def as IBoosterDefinition;
      forEach(booster.unlock, (k, v) => {
         value += v * (Config.NormalizedPrice.get(k) ?? 0);
      });
      return value;
   }
   forEach(def.output, (k, v) => {
      value += v * (Config.NormalizedPrice.get(k) ?? 0);
   });
   if (value <= 0) {
      forEach(def.input, (k, v) => {
         value += v * (Config.NormalizedPrice.get(k) ?? 0);
      });
   }
   if (value <= 0) {
      value = 1;
   }
   return value * data.level;
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
   while (resourceValueOf(resources) < getMaxSpaceshipXP(gs) && trySpend(resources, gs)) {
      tile.level++;
      resources = getBuildingValue(tile.type, tile.level + 1);
   }
}

export function canSpend(resources: Map<Resource, number>, gs: GameState): boolean {
   return (
      hasEnoughResources(resources, gs.resources) &&
      calcSpaceshipXP(gs) + resourceValueOf(resources) < getMaxSpaceshipXP(gs)
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
   if (isBooster(building)) {
      const booster = def as IBoosterDefinition;
      const cost = mapOf(booster.unlock, (res, value) => {
         return `${formatNumber(value)} ${Config.Resources[res].name()}`;
      }).join(" + ");
      return `${booster.desc()} (${AbilityRangeLabel[booster.range]()}): ${cost}`;
   }
   let left = "";
   let right = "";
   if ("output" in def) {
      right = mapOf(def.output, (res, value) => `${value} ${Config.Resources[res].name()}`).join(" + ");
   }
   if ("input" in def) {
      left = mapOf(def.input, (res, value) => `${value} ${Config.Resources[res].name()}`).join(" + ");
   }
   return `${left} => ${right}`;
}

export function normalizedValueToHp(normalizedValue: number, building: Building): number {
   const def = Config.Buildings[building];
   if (isBooster(building)) {
      return ((Config.BuildingTier.get(building) ?? 3) - 2) * 1000;
   }
   if (WeaponKey in def) {
      return normalizedValue * 10;
   }
   return normalizedValue * 50;
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
      if (isBooster(data.type)) {
         result++;
      }
   }
   return result;
}

export function isBooster(building: Building): boolean {
   return hasFlag(Config.Buildings[building].buildingFlag, BuildingFlag.Booster);
}

export function getBuildingTypes(tiles: Tiles): Set<Building> {
   const result = new Set<Building>();
   for (const [_, data] of tiles) {
      result.add(data.type);
   }
   return result;
}

export function getTopEndBuildings(buildings: Set<Building>): Set<Building> {
   const allInputs = new Set<Resource>();
   const result = new Set<Building>();
   for (const building of buildings) {
      const def = Config.Buildings[building];
      forEach(def.input, (k, v) => {
         allInputs.add(k);
      });
   }
   for (const building of buildings) {
      const def = Config.Buildings[building];
      let outputRequired = 0;
      forEach(def.output, (k, v) => {
         if (allInputs.has(k)) {
            ++outputRequired;
         }
      });
      if (outputRequired === 0) {
         result.add(building);
      }
   }
   return result;
}
