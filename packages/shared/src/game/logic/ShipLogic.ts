import { AABB, type IAABB } from "../../utils/AABB";
import { createTile, type Tile, tileToPoint } from "../../utils/Helper";
import type { IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import { type BlueprintDefinition, Blueprints } from "../definitions/Blueprints";
import type { Building } from "../definitions/Buildings";
import type { ShipClass } from "../definitions/ShipClass";
import type { GameState, Tiles } from "../GameState";
import { MaxX, MaxY } from "../Grid";
import type { ITileData } from "../ITileData";
import { Side } from "./Side";
import { getShipClass } from "./TechLogic";

export function calculateAABB(tiles: Iterable<Tile>): IAABB {
   let minX = Number.POSITIVE_INFINITY;
   let minY = Number.POSITIVE_INFINITY;
   let maxX = Number.NEGATIVE_INFINITY;
   let maxY = Number.NEGATIVE_INFINITY;

   for (const tile of tiles) {
      const { x, y } = tileToPoint(tile);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
   }

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

/**
 * Note this method will make a copy instead of mutating the original ship
 * It might seem inefficient, but not doing so has caused so many bugs so it's worth it
 */
export function flipHorizontalCopy(ship: GameState): GameState {
   const newShip = structuredClone(ship);
   newShip.tiles = flipTilesHorizontal(newShip.tiles);
   newShip.addons.forEach((data, addon) => {
      if (data.tile) {
         const { x, y } = tileToPoint(data.tile);
         data.tile = createTile(MaxX - 1 - x, y);
      }
   });
   return newShip;
}

export function flipTilesHorizontal<T>(tiles: Map<Tile, T>): Map<Tile, T> {
   const newTiles = new Map<Tile, T>();
   tiles.forEach((data, tile) => {
      const { x, y } = tileToPoint(tile);
      newTiles.set(createTile(MaxX - 1 - x, y), data);
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

export function shipAABB(ext: number, side: Side): IAABB {
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

export function validateShip(gs: GameState): boolean {
   const buildings = new Set<Building>();
   const blueprint = new Set(getShipBlueprint(gs));

   for (const [tile, _] of gs.tiles) {
      if (!blueprint.has(tile)) {
         return false;
      }
   }

   if (!isShipConnected(gs.tiles.keys())) {
      return false;
   }

   for (const tech of gs.unlockedTech) {
      const def = Config.Tech[tech];
      def.unlockBuildings?.forEach((b) => {
         buildings.add(b);
      });
      for (const r of def.requires) {
         if (!gs.unlockedTech.has(r)) {
            return false;
         }
      }
   }

   for (const [_tile, data] of gs.tiles) {
      if (!buildings.has(data.type)) {
         return false;
      }
   }

   return true;
}

export function getShipBlueprint(gs: GameState): number[] {
   return Blueprints[gs.blueprint].blueprint[getShipClass(gs)];
}

export function migrateShipForServer(gs: GameState): boolean {
   return false;
}

export function getFullShipBlueprint(data: BlueprintDefinition): number[] {
   let prev: ShipClass | undefined;
   let shipClass: ShipClass;
   for (shipClass in data) {
      if (data[shipClass].length === 0 && prev) {
         return data[prev];
      }
      prev = shipClass;
   }
   console.error("No full ship blueprint found, data:", data);
   return [];
}
