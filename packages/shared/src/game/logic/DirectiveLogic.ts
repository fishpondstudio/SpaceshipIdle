import { shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import { type Boost, Boosts } from "../definitions/Boosts";
import { DirectiveChoiceCount } from "../definitions/Constant";
import { Directives } from "../definitions/Directives";
import { ShipClass } from "../definitions/ShipClass";
import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";

export function getDirectives(shipClass: ShipClass, gs: GameState): Boost[] {
   const candidates = Directives[shipClass].slice(0);
   return shuffle(candidates, srand(gs.seed)).slice(0, DirectiveChoiceCount);
}

export function tickDirective(gs: GameState, rt: Runtime): void {
   gs.selectedDirectives.forEach((boost, shipClass) => {
      Boosts[boost].onTick?.(Number.POSITIVE_INFINITY, t(L.XClassDirective, ShipClass[shipClass].name()), rt);
   });
}
