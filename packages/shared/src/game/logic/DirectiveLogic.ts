import { shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { srand } from "../../utils/Random";
import { Blueprints } from "../definitions/Blueprints";
import { Bonus } from "../definitions/Bonus";
import { DirectiveChoiceCount } from "../definitions/Constant";
import { Directives } from "../definitions/Directives";
import { ShipClass, ShipClassList } from "../definitions/ShipClass";
import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";
import { getShipClass, getTechInShipClass } from "./TechLogic";

export function getDirectives(shipClass: ShipClass, gs: GameState): Bonus[] {
   const candidates = Directives[shipClass].slice(0);
   return shuffle(candidates, srand(gs.seed)).slice(0, DirectiveChoiceCount);
}

export function tickDirective(gs: GameState, rt: Runtime): void {
   gs.selectedDirectives.forEach((boost, shipClass) => {
      Bonus[boost].onTick?.(Number.POSITIVE_INFINITY, t(L.XClassDirective, ShipClass[shipClass].name()), rt);
   });
}

export function hasUnlockedDirective(shipClass: ShipClass, gs: GameState): boolean {
   const techs = getTechInShipClass(shipClass);
   if (techs.length === 0) {
      return false;
   }
   for (const tech of techs) {
      if (!gs.unlockedTech.has(tech)) {
         return false;
      }
   }
   const blueprint = Blueprints[gs.blueprint].blueprint[shipClass];
   if (blueprint.length === 0) {
      return false;
   }
   if (gs.tiles.size < blueprint.length) {
      return false;
   }
   return true;
}

export function hasSelectableDirectives(gs: GameState): boolean {
   const currentShipClass = getShipClass(gs);
   const index = ShipClassList.indexOf(currentShipClass);
   for (let i = 0; i <= index; ++i) {
      const shipClass = ShipClassList[i];
      if (!gs.selectedDirectives.has(shipClass) && hasUnlockedDirective(shipClass, gs)) {
         return true;
      }
   }
   return false;
}
