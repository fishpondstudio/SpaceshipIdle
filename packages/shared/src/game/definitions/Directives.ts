import { forEach } from "../../utils/Helper";
import { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const Directives: Record<ShipClass, Bonus[]> = {
   Skiff: [
      "GetSkiffClassXPOnDecl",
      "Get20VictoryPointOnDecl",
      "ResetBackstabberOnDecl",
      "Get8hWarpOnDecl",
      "Get5ExtraXPPerSec",
   ],
   Scout: [
      "GetScoutClassXPOnDecl",
      "Get30VictoryPointOnDecl",
      "ResetBackstabberOnDecl",
      "Reduce10WarmongerPerSec",
      "Get12hWarpOnDecl",
      "Get10ExtraXPPerSec",
   ],
   Corvette: [
      "GetCorvetteClassXPOnDecl",
      "Get40VictoryPointOnDecl",
      "ResetBackstabberOnDecl",
      "Get16hWarpOnDecl",
      "Get15ExtraXPPerSec",
   ],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Carrier: [],
   Dreadnought: [],
} as const;

forEach(Directives, (_, bonuses) => {
   bonuses.forEach((bonus) => {
      console.assert(
         Bonus[bonus].onStart || Bonus[bonus].onTick,
         `Directive bonus (${bonus}) must have onStart or onTick`,
      );
      console.assert(!Bonus[bonus].onStop, `Directive bonus (${bonus}) must not have onStop`);
   });
});
