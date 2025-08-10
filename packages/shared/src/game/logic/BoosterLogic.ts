import { forEach, shuffle } from "../../utils/Helper";
import { type Booster, Boosters } from "../definitions/Boosters";
import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";
import { getShipClass } from "./TechLogic";

export function tickBooster(gs: GameState, rt: Runtime): void {
   gs.tiles.forEach((data, tile) => {
      const rs = rt.get(tile);
      if (!rs) {
         return;
      }
      rs.booster = null;
   });
   gs.boosters.forEach((data, booster) => {
      if (data.tile) {
         const rs = rt.get(data.tile);
         if (rs) {
            rs.booster = booster;
         }
      }
   });
}

export function rollBooster(gs: GameState): Booster | null {
   const shipClass = getShipClass(gs);
   const candidates: Booster[] = [];
   forEach(Boosters, (booster, def) => {
      if (def.shipClass === shipClass) {
         candidates.push(booster);
      }
   });
   if (candidates.length === 0) {
      return null;
   }
   shuffle(candidates);
   return candidates[0];
}
