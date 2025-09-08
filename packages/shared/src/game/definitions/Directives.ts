import { forEach } from "../../utils/Helper";
import { Bonus } from "./Bonus";
import type { ShipClass } from "./ShipClass";

export const Directives: Record<ShipClass, Bonus[]> = {
   Skiff: ["GetSkiffClassXPOnDecl", "Get20VictoryPointOnDecl", "ResetBackstabberOnDecl", "Get8hWarpOnDecl"],
   Scout: ["GetScoutClassXPOnDecl", "Get30VictoryPointOnDecl", "ResetBackstabberOnDecl", "Get12hWarpOnDecl"],
   Corvette: ["GetCorvetteClassXPOnDecl", "Get40VictoryPointOnDecl", "ResetBackstabberOnDecl", "Get16hWarpOnDecl"],
   Frigate: [],
   Destroyer: [],
   Cruiser: [],
   Battlecruiser: [],
   Carrier: [],
   Dreadnought: [],
} as const;

forEach(Directives, (_, bonuses) => {
   bonuses.forEach((bonus) => {
      console.assert(Bonus[bonus].onStart, `Directive bonus (${bonus}) must have onStart`);
      console.assert(!Bonus[bonus].onStop, `Directive bonus (${bonus}) must not have onStop`);
      console.assert(!Bonus[bonus].onTick, `Directive bonus (${bonus}) must not have onTick`);
   });
});
