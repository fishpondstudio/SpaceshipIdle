import { createTile, type Tile, tileToPoint } from "../utils/Helper";
import type { IHaveXY } from "../utils/Vector2";

export const GridSize = 100;
export const MaxX = 200;
export const MaxY = 100;
// Here max bits is 30 instead of 31 because we need last bit for our own tagging
// It was 31 instead of 32 because V8 uses the last bit for small integer tagging
export const MaxTileBits = 30;
export const MaxTile = (1 << MaxTileBits) - 1;

export function getSize() {
   return { width: MaxX * GridSize, height: MaxY * GridSize };
}

export function tileToPos(tile: Tile): IHaveXY {
   const result = tileToPoint(tile);
   result.x *= GridSize;
   result.y *= GridSize;
   return result;
}

export function posToTile(pos: IHaveXY): Tile {
   return createTile(pos.x / GridSize, pos.y / GridSize);
}

export function tileToPosCenter(tile: Tile): IHaveXY {
   const result = tileToPoint(tile);
   result.x = (result.x + 0.5) * GridSize;
   result.y = (result.y + 0.5) * GridSize;
   return result;
}

export function forEachNeighbor(tile: Tile, distance: number, func: (tile: Tile) => void): void {
   const { x: tileX, y: tileY } = tileToPoint(tile);
   for (let y = tileY - distance; y <= tileY + distance; y++) {
      for (let x = tileX - distance; x <= tileX + distance; x++) {
         if (x === tileX && y === tileY) continue;
         func(createTile(x, y));
      }
   }
}
