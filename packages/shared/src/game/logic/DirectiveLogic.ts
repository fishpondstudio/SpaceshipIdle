import { shuffle } from "../../utils/Helper";
import { srand } from "../../utils/Random";
import type { Boost } from "../definitions/Boosts";
import { DirectiveChoiceCount } from "../definitions/Constant";
import { Directives } from "../definitions/Directives";
import type { ShipClass } from "../definitions/ShipClass";
import type { GameState } from "../GameState";

export function getDirectives(shipClass: ShipClass, gs: GameState): Boost[] {
   const candidates = Directives[shipClass].slice(0);
   return shuffle(candidates, srand(gs.seed)).slice(0, DirectiveChoiceCount);
}
