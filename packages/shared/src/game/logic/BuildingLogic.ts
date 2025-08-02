import { mapSafeAdd } from "../../utils/Helper";
import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import { DamageToHPMultiplier, MaxBuildingCount } from "../definitions/Constant";
import { ShipClass } from "../definitions/TechDefinitions";
import type { GameState, Tiles } from "../GameState";
import type { ITileData } from "../ITileData";
import { getCooldownMultiplier } from "./BattleLogic";

export function getNextLevel(currentLevel: number, x: number): number {
   return (Math.floor(currentLevel / x) + 1) * x;
}

export const _fibTable = new Map<number, number>();

export function fib(n: number): number {
   const cached = _fibTable.get(n);
   if (cached !== undefined) {
      return cached;
   }
   let a = 0;
   let b = 1;
   let c = 1;
   for (let i = 0; i <= n; ++i) {
      c = a + b;
      a = b;
      b = c;
   }
   _fibTable.set(n, a);
   return a;
}

export function hashBuildingAndLevel(building: Building, level: number): number {
   return level * MaxBuildingCount + Config.BuildingId[building];
}

export function getBuildingCost(building: Building, level: number): number {
   return getBaseValue(building) * fib(level);
}

export function getTotalBuildingCost(building: Building, currentLevel: number, targetLevel: number): number {
   const min = Math.min(currentLevel, targetLevel);
   const max = Math.max(currentLevel, targetLevel);
   let result = 0;
   for (let level = min + 1; level <= max; ++level) {
      result += getBuildingCost(building, level);
   }
   return result;
}

function getBaseValue(building: Building): number {
   const shipClass = Config.BuildingToShipClass[building];
   return (ShipClass[shipClass].index + 1) * 10;
}

export function getBuildingName(building: Building): string {
   return `${building} ${Config.Buildings[building].pet()}`;
}

export function getHP({ type, level }: { type: Building; level: number }): number {
   return getBaseValue(type) * level * DamageToHPMultiplier;
}

export function getDamagePerFire({ type, level }: { type: Building; level: number }): number {
   return getBaseValue(type) * level * getCooldownMultiplier({ type });
}

export function upgradeMax(tile: ITileData, gs: GameState): void {
   let xp = getBuildingCost(tile.type, tile.level + 1);
   while (trySpend(xp, gs)) {
      tile.level++;
      xp = getBuildingCost(tile.type, tile.level + 1);
   }
}

export function canSpend(xp: number, gs: GameState): boolean {
   return (gs.resources.get("XP") ?? 0) - (gs.resources.get("XPUsed") ?? 0) >= xp;
}

export function trySpend(xp: number, gs: GameState): boolean {
   if (!canSpend(xp, gs)) {
      return false;
   }
   mapSafeAdd(gs.resources, "XPUsed", xp);
   return true;
}

export function getUnlockedBuildings(gs: GameState): Building[] {
   return Array.from(gs.unlockedTech).flatMap((t) => Config.Tech[t].unlockBuildings ?? []);
}

export function hasConstructed(building: Building, gs: GameState): boolean {
   for (const [tile, data] of gs.tiles) {
      if (data.type === building) {
         return true;
      }
   }
   return false;
}

export function getBuildingTypes(tiles: Tiles): Set<Building> {
   const result = new Set<Building>();
   for (const [_, data] of tiles) {
      result.add(data.type);
   }
   return result;
}
