import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { validateForClient } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import { hasFlag, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { CRTFilter } from "pixi-filters";
import { clientUpdate } from "./ClientUpdate";
import { ShipScene } from "./scenes/ShipScene";
import { PrestigeReason } from "./ui/PrestigeReason";
import { showPrestigeModal } from "./ui/ShowPrestigeModal";
import { G } from "./utils/Global";

export function startGameLoop(): void {
   let filter: CRTFilter | undefined;

   if (hasFlag(G.save.options.flag, GameOptionFlag.RetroFilter)) {
      filter = new CRTFilter();
      G.scene.root.filters = [filter];
   }

   if (!import.meta.env.DEV && !validateForClient(G.save.current)) {
      G.save.current.flags = setFlag(G.save.current.flags, GameStateFlags.Incompatible);
   }

   const i = 0;
   G.runtime = new Runtime(G.save, new GameState());
   G.runtime.createXPTarget();

   G.pixi.ticker.add(() => {
      const unscaled = G.pixi.ticker.deltaMS / 1000;
      const dt = unscaled * G.speed;
      if (hasFlag(G.save.current.flags, GameStateFlags.Incompatible)) {
         showPrestigeModal(PrestigeReason.Incompatible);
         return;
      }

      G.runtime.tick(dt, G);
      G.scene.getCurrent(ShipScene)?.render(G.runtime, dt, G.runtime.battleTimer);
      G.starfield.update();
      clientUpdate(unscaled);
      if (filter) {
         filter.time += unscaled * 5;
      }
   });
}
