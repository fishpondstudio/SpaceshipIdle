import { shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import { Bonus } from "../definitions/Bonus";
import { DirectiveChoiceCount } from "../definitions/Constant";
import { Directives } from "../definitions/Directives";
import { ShipClass } from "../definitions/ShipClass";
import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";

export function getDirectives(shipClass: ShipClass, gs: GameState): Bonus[] {
   const candidates = Directives[shipClass].slice(0);
   return shuffle(candidates, srand(gs.seed)).slice(0, DirectiveChoiceCount);
}

export function tickDirective(gs: GameState, rt: Runtime): void {
   gs.selectedDirectives.forEach((boost, shipClass) => {
      Bonus[boost].onTick?.(Number.POSITIVE_INFINITY, t(L.XClassDirective, ShipClass[shipClass].name()), rt);
   });
}
