import type { Building } from "./definitions/Buildings";

export interface ITileData {
   level: number;
   type: Building;
   priority: number;
   capacity: number;
}

export function makeTile(type: Building, level: number): ITileData {
   return { type, level, priority: 5, capacity: 1 };
}
