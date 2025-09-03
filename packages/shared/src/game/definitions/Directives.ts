import type { Boost } from "./Boosts";
import type { ShipClass } from "./ShipClass";

export const Directives: Record<ShipClass, Boost[]> = {
   Skiff: ["B4", "B5", "B6", "B7"],
   Scout: [],
   Corvette: [],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Carrier: [],
   Dreadnought: [],
};
