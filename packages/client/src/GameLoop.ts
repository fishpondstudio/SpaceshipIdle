import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { CRTFilter } from "pixi-filters";
import { clientUpdate } from "./ClientUpdate";
import { ShipScene } from "./scenes/ShipScene";
import { showForcePrestigeModal } from "./ui/ShowPrestigeModal";
import { G } from "./utils/Global";

export function startGameLoop(): void {
   let filter: CRTFilter | undefined;

   if (hasFlag(G.save.options.flag, GameOptionFlag.RetroFilter)) {
      filter = new CRTFilter();
      G.pixi.stage.filters = [filter];
   }

   let i = 0;
   G.runtime = new Runtime(G.save, new GameState());
   G.runtime.createEnemy(++i);

   G.pixi.ticker.add(() => {
      const unscaled = G.pixi.ticker.deltaMS / 1000;
      const dt = unscaled * G.speed;
      if (hasFlag(G.save.current.flags, GameStateFlags.Prestige)) {
         showForcePrestigeModal();
         return;
      }
      G.runtime.tick(dt, G);
      G.scene.getCurrent(ShipScene)?.render(G.runtime, dt, G.runtime.battleTimer);
      clientUpdate(unscaled);
      if (filter) {
         filter.time += unscaled * 5;
      }
   });
}
