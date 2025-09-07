import type { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const Directives: Record<ShipClass, Bonus[]> = {
   Skiff: ["GetSkiffClassXPOnDecl", "Get20VictoryPointOnDecl", "ResetBackstabberPenaltyTo0OnDecl", "Get8hWarpOnDecl"],
   Scout: [],
   Corvette: [],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Carrier: [],
   Dreadnought: [],
} as const;
