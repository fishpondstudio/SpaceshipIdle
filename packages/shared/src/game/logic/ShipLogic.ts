import { createTile, type Tile, tileToPoint } from "../../utils/Helper";
import { AABB, type IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import type { GameState, Tiles } from "../GameState";
import { MaxX, MaxY } from "../Grid";
import type { ITileData } from "../ITileData";
import {
   calcSpaceshipValue,
   getMatchmakingQuantum,
   getMaxSpaceshipValue,
   getQuantumLimit,
   getUsedQuantum,
} from "./ResourceLogic";
import { Side } from "./Side";

export function calculateAABB(tiles: Tiles): AABB {
   let minX = Number.POSITIVE_INFINITY;
   let minY = Number.POSITIVE_INFINITY;
   let maxX = Number.NEGATIVE_INFINITY;
   let maxY = Number.NEGATIVE_INFINITY;

   tiles.forEach((data, tile) => {
      const { x, y } = tileToPoint(tile);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
   });

   return new AABB({ x: minX, y: minY }, { x: maxX, y: maxY });
}

export function shiftTiles(tiles: Tiles, dir: IHaveXY): Map<Tile, ITileData> {
   const newTiles = new Map<Tile, ITileData>();
   tiles.forEach((data, tile) => {
      const { x, y } = tileToPoint(tile);
      const newTile = createTile(x + dir.x, y + dir.y);
      newTiles.set(newTile, data);
   });
   return newTiles;
}

export function flipHorizontal(tiles: Tiles): Map<Tile, ITileData> {
   const newTiles = new Map<Tile, ITileData>();
   tiles.forEach((data, tile) => {
      const { x, y } = tileToPoint(tile);
      const newTile = createTile(MaxX - 1 - x, y);
      newTiles.set(newTile, data);
   });
   return newTiles;
}

export function isTileConnected(tile: Tile, gs: GameState): boolean {
   const { x, y } = tileToPoint(tile);
   if (gs.tiles.has(createTile(x + 1, y))) return true;
   if (gs.tiles.has(createTile(x - 1, y))) return true;
   if (gs.tiles.has(createTile(x, y + 1))) return true;
   if (gs.tiles.has(createTile(x, y - 1))) return true;
   return false;
}

export function isShipConnected(t: Iterable<Tile>): boolean {
   const tiles = new Set(t);
   const startTile = tiles.keys().next().value;
   if (!startTile) return false;
   const visited = new Set<Tile>();

   // Stack for DFS (Depth-First Search)
   const stack: Tile[] = [startTile];

   while (stack.length > 0) {
      const currentTile = stack.pop()!;
      if (visited.has(currentTile)) continue;

      visited.add(currentTile);

      // Check all 4 adjacent tiles
      const { x, y } = tileToPoint(currentTile);
      const adjacentTiles = [createTile(x + 1, y), createTile(x - 1, y), createTile(x, y + 1), createTile(x, y - 1)];

      for (const adjTile of adjacentTiles) {
         if (tiles.has(adjTile) && !visited.has(adjTile)) {
            stack.push(adjTile);
         }
      }
   }

   // Ship is connected if we visited all tiles
   return visited.size === tiles.size;
}

export function shipExtent(gs: GameState): number {
   if (gs.unlockedTech.has("J15")) return 11;
   if (gs.unlockedTech.has("I13")) return 10;
   if (gs.unlockedTech.has("H12")) return 9;
   if (gs.unlockedTech.has("G11")) return 8;
   if (gs.unlockedTech.has("F10")) return 7;
   if (gs.unlockedTech.has("E8")) return 6;
   if (gs.unlockedTech.has("D6")) return 5;
   if (gs.unlockedTech.has("C5")) return 4;
   return 3;
}

export function shipAABB(ext: number, side: Side): AABB {
   const min = { x: MaxX / 2 - 2 * ext - 1, y: MaxY / 2 - ext };
   const max = { x: MaxX / 2 - 2, y: MaxY / 2 + ext - 1 };
   if (side === Side.Right) {
      const maxX = MaxX - min.x - 1;
      const minX = MaxX - max.x - 1;
      min.x = minX;
      max.x = maxX;
   }
   return new AABB(min, max);
}

export function isEnemy(tile: Tile): boolean {
   const { x, y } = tileToPoint(tile);
   return x >= MaxX / 2;
}

export function isWithinShipExtent(tile: Tile, gs: GameState): boolean {
   const ext = shipExtent(gs);
   const { x, y } = tileToPoint(tile);
   const center = { x: (MaxX >> 1) - ext - 1, y: MaxY >> 1 };
   return x >= center.x - ext && x < center.x + ext && y >= center.y - ext && y < center.y + ext;
}

export function validateForClient(gs: GameState): boolean {
   const quantumLimit = getQuantumLimit(gs);
   const usedQuantum = getUsedQuantum(gs);
   if (usedQuantum > quantumLimit) {
      return false;
   }
   return _validateShip(gs);
}

export function validateForMatchmaking(gs: GameState): boolean {
   const mmQuantum = getMatchmakingQuantum(gs);
   const usedQuantum = getUsedQuantum(gs);
   if (mmQuantum !== usedQuantum) {
      return false;
   }
   return _validateShip(gs);
}

function _validateShip(gs: GameState): boolean {
   const sv = calcSpaceshipValue(gs);
   const maxSV = getMaxSpaceshipValue(gs);
   if (sv > maxSV) {
      return false;
   }

   const buildings = new Set<Building>();
   gs.unlockedTech.forEach((tech) => {
      Config.Tech[tech].unlockBuildings?.forEach((b) => {
         buildings.add(b);
      });
   });

   for (const [tile, data] of gs.tiles) {
      if (!buildings.has(data.type)) {
         return false;
      }
   }

   for (const [element, amount] of gs.elements) {
      const building = Config.Element.get(element);
      if (!building) {
         return false;
      }
      if (!buildings.has(building)) {
         return false;
      }
   }

   return true;
}

export function isQualifierBattle(me: GameState, enemy: GameState): boolean {
   if (getUsedQuantum(me) < getQuantumLimit(me)) {
      return false;
   }
   if (getUsedQuantum(enemy) !== getMatchmakingQuantum(me)) {
      return false;
   }
   return true;
}
