import { createTile, type Tile, tileToPoint } from "../utils/Helper";
import type { IHaveXY } from "../utils/Vector2";

export const GridSize = 100;
export const MaxX = 200;
export const MaxY = 100;

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
