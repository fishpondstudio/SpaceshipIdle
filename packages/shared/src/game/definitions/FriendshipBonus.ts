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
      "Get100hWarpOnExp",
      "Get5ExtraXPPerSec",
   ],
   Scout: [
      "ScoutClass1XPMultiplier",
      "SkiffClass2XPMultiplier",
      "Reduce10WarmongerPerSec",
      "Reduce2MinWarmonger",
      "Get10VictoryPointOnExp",
      "Get4VictoryPointOnDeclExp",
      "Get5VictoryPointOnDecl",
      "Get125hWarpOnExp",
      "Get10ExtraXPPerSec",
   ],
   Corvette: [
      "CorvetteClass1XPMultiplier",
      "ScoutClass2XPMultiplier",
      "Reduce15WarmongerPerSec",
      "Reduce3MinWarmonger",
      "Get12VictoryPointOnExp",
      "Get5VictoryPointOnDeclExp",
      "Get6VictoryPointOnDecl",
      "Get150hWarpOnExp",
      "Get15ExtraXPPerSec",
   ],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Dreadnought: [],
   Carrier: [],
} as const;
