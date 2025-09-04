import { forEach, shuffle } from "../../utils/Helper";
import { type Addon, Addons } from "../definitions/Addons";
import type { ShipClass } from "../definitions/ShipClass";
import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";
import { getShipClass } from "./TechLogic";

export function tickAddon(gs: GameState, rt: Runtime): void {
   gs.tiles.forEach((data, tile) => {
      const rs = rt.get(tile);
      if (!rs) {
         return;
      }
      rs.addon = null;
   });
   gs.addons.forEach((data, addon) => {
      if (data.tile) {
         const rs = rt.get(data.tile);
         if (rs) {
            rs.addon = addon;
         }
         const def = Addons[addon];
         def.tick(data.amount, data.tile, rt);
      }
   });
}

export function rollAddon(gs: GameState): Addon | null {
   const shipClass = getShipClass(gs);
   const candidates: Addon[] = [];
   forEach(Addons, (addon, def) => {
      if (def.shipClass === shipClass) {
         candidates.push(addon);
      }
   });
   if (candidates.length === 0) {
      return null;
   }
   shuffle(candidates);
   return candidates[0];
}

export function hasUnequippedAddon(gs: GameState): boolean {
   for (const data of gs.addons.values()) {
      if (data.amount > 0 && data.tile === null) {
         return true;
      }
   }
   return false;
}

export function getAddonsInClass(shipClass: ShipClass): Addon[] {
   const candidates: Addon[] = [];
   forEach(Addons, (addon, def) => {
      if (def.shipClass === shipClass) {
         candidates.push(addon);
      }
   });
   return candidates;
}
