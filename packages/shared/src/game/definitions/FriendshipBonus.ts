import type { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const FriendshipBonus: Record<ShipClass, Bonus[]> = {
   Skiff: [
      "SkiffClass1XPMultiplier",
      "Reduce1WarmongerPerSec",
      "Get8VictoryPointOnExp",
      "Get3VictoryPointOnDeclExp",
      "Get4VictoryPointOnDecl",
      "Get2hWarpOnExp",
   ],
   Scout: [],
   Corvette: [],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Dreadnought: [],
   Carrier: [],
} as const;
