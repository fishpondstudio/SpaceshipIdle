import type { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const FriendshipBonus: Record<ShipClass, Bonus[]> = {
   Skiff: ["F1a", "F1b", "F1c", "F1d"],
   Scout: ["F1a", "F1b", "F1c"],
   Corvette: ["F1a", "F1b", "F1c"],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Dreadnought: [],
   Carrier: [],
} as const;
