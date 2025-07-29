import type { GameState } from "../GameState";
import type { Runtime } from "./Runtime";

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
