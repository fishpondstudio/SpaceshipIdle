import { AABB } from "../../utils/AABB";
import { createTile, type Tile, tileToPoint } from "../../utils/Helper";
import type { IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import { ShipDesigns } from "../definitions/ShipDesign";
import type { GameState, Tiles } from "../GameState";
import { MaxX, MaxY } from "../Grid";
import type { ITileData } from "../ITileData";
import { getTotalQuantum, getUsedQuantum } from "./QuantumElementLogic";
import { Side } from "./Side";
import { getShipClass } from "./TechLogic";

export function calculateAABB(tiles: Tiles): AABB {
   let minX = Number.POSITIVE_INFINITY;
   let minY = Number.POSITIVE_INFINITY;
   let maxX = Number.NEGATIVE_INFINITY;
   let maxY = Number.NEGATIVE_INFINITY;

   tiles.forEach((_data, tile) => {
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

export function getSide(tile: Tile): Side {
   return isEnemy(tile) ? Side.Right : Side.Left;
}

export function isWithinShipExtent(tile: Tile, gs: GameState): boolean {
   const blueprint = getShipBlueprint(gs);
   return blueprint.includes(tile);
}

export function validateForClient(gs: GameState): boolean {
   try {
      const quantumLimit = getTotalQuantum(gs);
      const usedQuantum = getUsedQuantum(gs);
      if (usedQuantum > quantumLimit) {
         return false;
      }
      return _validateShip(gs);
   } catch (e) {
      console.error(e);
      return false;
   }
}

export function validateForMatchmaking(gs: GameState): boolean {
   try {
      const quantumLimit = getTotalQuantum(gs);
      const usedQuantum = getUsedQuantum(gs);
      if (quantumLimit !== usedQuantum) {
         return false;
      }
      return _validateShip(gs);
   } catch (e) {
      console.error(e);
      return false;
   }
}

function _validateShip(gs: GameState): boolean {
   const buildings = new Set<Building>();
   gs.unlockedTech.forEach((tech) => {
      const def = Config.Tech[tech];
      def.unlockBuildings?.forEach((b) => {
         buildings.add(b);
      });
      for (const r of def.requires) {
         if (!gs.unlockedTech.has(r)) {
            return false;
         }
      }
   });

   for (const [_tile, data] of gs.tiles) {
      if (!buildings.has(data.type)) {
         return false;
      }
   }

   for (const [element, _amount] of gs.elements) {
      const building = Config.Elements[element];
      if (!building) {
         return false;
      }
      if (!buildings.has(building)) {
         return false;
      }
   }

   return true;
}

export function isQualifierBattle(gs: GameState): boolean {
   const quantumLimit = getTotalQuantum(gs);
   const usedQuantum = getUsedQuantum(gs);
   if (usedQuantum < quantumLimit) {
      return false;
   }
   // FIXME
   // const sv = calcSpaceshipXP(gs);
   // const maxSV = getMaxSpaceshipXP(gs);
   // if (sv < QualifierSpaceshipValuePercent * maxSV) {
   //    return false;
   // }
   return true;
}

export function getShipBlueprint(gs: GameState): number[] {
   return ShipDesigns[gs.shipDesign][getShipClass(gs)];
}

export function migrateShipForServer(ship: GameState): boolean {
   return false;
}

export function migrateBuildingsAndResources(gs: GameState): boolean {
   return false;
}
