import type { Boost } from "./Boosts";
import type { ShipClass } from "./ShipClass";

export const Directives: Record<ShipClass, Boost[]> = {
   Skiff: ["D1a", "D1b", "D1c", "D1d", "D1e"],
   Scout: ["D1a", "D1b", "D1c", "D1d", "D1e"],
   Corvette: [],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Carrier: [],
   Dreadnought: [],
} as const;
