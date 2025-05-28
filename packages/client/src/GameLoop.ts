import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, GameStateFlags } from "@spaceship-idle/shared/src/game/GameState";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { RingBuffer } from "@spaceship-idle/shared/src/utils/RingBuffer";
import { CRTFilter } from "pixi-filters";
import { BitmapText } from "pixi.js";
import { Fonts } from "./assets";
import { clientUpdate } from "./ClientUpdate";
import { getVersion } from "./game/Version";
import { ShipScene } from "./scenes/ShipScene";
import { showForcePrestigeModal } from "./ui/ShowPrestigeModal";
import { G } from "./utils/Global";

export function startGameLoop(): void {
   let filter: CRTFilter | undefined;

   if (hasFlag(G.save.options.flag, GameOptionFlag.RetroFilter)) {
      filter = new CRTFilter();
      G.scene.root.filters = [filter];
   }

   let i = 0;
   G.runtime = new Runtime(G.save, new GameState());
   G.runtime.createEnemy(++i);

   const version = getVersion();
   const watermark = G.scene.overlay.addChild(
      new BitmapText(version, { fontName: Fonts.SpaceshipIdle, fontSize: 12, tint: 0x999999, align: "right" }),
   );
   watermark.anchor.set(1, 1);
   watermark.position.set(G.pixi.screen.width - 10, G.pixi.screen.height - 10);
   const fps = new RingBuffer<number>(120);

   G.pixi.ticker.add(() => {
      fps.push(G.pixi.ticker.FPS);
      const result = fps.reduce(sum, 0);
      watermark.text = `FPS: ${Math.round(result / fps.size)}   ${navigator.onLine ? "ONLINE" : "OFFLINE"}\nVERSION: ${version}`;

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

function sum(result: number, value: number): number {
   return result + value;
}
