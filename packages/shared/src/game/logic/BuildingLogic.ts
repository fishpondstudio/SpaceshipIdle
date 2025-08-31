import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import { DamageToHPMultiplier, MaxBuildingCount } from "../definitions/Constant";
import { ShipClassList } from "../definitions/ShipClass";
import type { GameState, Tiles } from "../GameState";
import type { ITileData } from "../ITileData";
import { getCooldownMultiplier } from "./BattleLogic";
import { trySpendResource } from "./ResourceLogic";

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
   return ShipClassList.indexOf(shipClass) + 1;
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
   while (trySpendResource("XP", xp, gs.resources)) {
      tile.level++;
      xp = getBuildingCost(tile.type, tile.level + 1);
   }
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

type BuildingCodeParts = {
   type: string;
   series: number;
   variant?: string;
};

export function parseBuildingCode(name: string): BuildingCodeParts {
   const type = name.slice(0, 2);
   let i = 2;
   while (i < name.length && name[i] >= "0" && name[i] <= "9") {
      i++;
   }
   const series = Number.parseInt(name.slice(2, i), 10);
   const variant = i < name.length ? name.slice(i) : undefined;
   return { type, series, variant };
}
