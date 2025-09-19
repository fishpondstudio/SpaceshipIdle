import type { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const FriendshipBonus: Record<ShipClass, Bonus[]> = {
   Skiff: [
      "SkiffClass1XPMultiplier",
      "Reduce10WarmongerPerSec",
      "Reduce1MinWarmonger",
      "Get8VictoryPointOnExp",
      "Get3VictoryPointOnDeclExp",
      "Get4VictoryPointOnDecl",
      "Get2hWarpOnExp",
      "Get5ExtraXPPerSec",
   ],
   Scout: [
      "ScoutClass1XPMultiplier",
      "SkiffClass2XPMultiplier",
      "Reduce10WarmongerPerSec",
      "Get10VictoryPointOnExp",
      "Get4VictoryPointOnDeclExp",
      "Get5VictoryPointOnDecl",
      "Get3hWarpOnExp",
      "Get10ExtraXPPerSec",
   ],
   Corvette: [
      "CorvetteClass1XPMultiplier",
      "ScoutClass2XPMultiplier",
      "Reduce15WarmongerPerSec",
      "Get12VictoryPointOnExp",
      "Get5VictoryPointOnDeclExp",
      "Get6VictoryPointOnDecl",
      "Get4hWarpOnExp",
      "Get15ExtraXPPerSec",
   ],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Dreadnought: [],
   Carrier: [],
} as const;
