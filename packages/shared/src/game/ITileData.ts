import type { Building } from "./definitions/Buildings";

export interface ITileData {
   level: number;
   type: Building;
}

export function makeTile(type: Building, level: number): ITileData {
   return { type, level };
}
