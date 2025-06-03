import type { Building } from "./definitions/Buildings";
import { DefaultPriority } from "./definitions/Constant";

export interface ITileData {
   level: number;
   type: Building;
   priority: number;
   capacity: number;
}

export function makeTile(type: Building, level: number): ITileData {
   return { type, level, priority: DefaultPriority, capacity: 1 };
}
