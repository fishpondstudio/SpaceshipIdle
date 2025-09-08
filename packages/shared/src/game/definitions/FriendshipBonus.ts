import type { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const FriendshipBonus: Record<ShipClass, Bonus[]> = {
   Skiff: [
      "SkiffClass1XPMultiplier",
      "Reduce10WarmongerPerSec",
      "Get8VictoryPointOnExp",
      "Get3VictoryPointOnDeclExp",
      "Get4VictoryPointOnDecl",
      "Get2hWarpOnExp",
   ],
   Scout: [
      "ScoutClass1XPMultiplier",
      "SkiffClass2XPMultiplier",
      "Reduce10WarmongerPerSec",
      "Get10VictoryPointOnExp",
      "Get4VictoryPointOnDeclExp",
      "Get5VictoryPointOnDecl",
      "Get3hWarpOnExp",
   ],
   Corvette: [
      "CorvetteClass1XPMultiplier",
      "ScoutClass2XPMultiplier",
      "Reduce15WarmongerPerSec",
      "Get12VictoryPointOnExp",
      "Get5VictoryPointOnDeclExp",
      "Get6VictoryPointOnDecl",
      "Get4hWarpOnExp",
   ],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Dreadnought: [],
   Carrier: [],
} as const;
