import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { type ColorSource, Container, type FederatedPointerEvent, Sprite } from "pixi.js";
import { G } from "../utils/Global";
import { type ISceneContext, Scene } from "../utils/SceneManager";

export class GalaxyScene extends Scene {
   private graphics: SmoothGraphics;
   private ship: Sprite;
   private ships: Container<Sprite>;
   private size = 1000;

   backgroundColor(): ColorSource {
      return 0x000000;
   }
   id(): string {
      return GalaxyScene.name;
   }

   constructor(context: ISceneContext) {
      super(context);

      const { app, textures } = this.context;

      const minZoom = Math.min(app.screen.width / this.size, app.screen.height / this.size);

      this.viewport.setWorldSize(this.size, this.size);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.center = { x: this.size / 2, y: this.size / 2 };
      this.viewport.setWorldSize(this.size, this.size);
      this.viewport.zoom = minZoom;

      this.graphics = this.viewport.addChild(new SmoothGraphics());

      this.graphics.lineStyle({
         width: 2,
         color: 0xffffff,
         alpha: 0.25,
         alignment: 0,
         scaleMode: LINE_SCALE_MODE.NONE,
      });
      this.graphics.drawCircle(this.size / 2, this.size / 2, 100);

      this.ships = this.viewport.addChild(new Container<Sprite>());

      const galaxy = this.viewport.addChild(new Sprite(textures.get("Others/Galaxy")));
      galaxy.position.set(this.size / 2, this.size / 2);
      galaxy.anchor.set(0.5);
      galaxy.scale.set(2);

      this.ship = this.ships.addChild(new Sprite(textures.get("Others/Pirate")));
      this.ship.anchor.set(0.5);
   }

   onEnable(): void {
      super.onEnable();
      const r = (G.runtime?.productionTick ?? 0) / 60;
      this.ship.position.set(this.size / 2 + Math.sin(r) * 100, this.size / 2 + Math.cos(r) * 100);
   }

   onDisable(): void {
      super.onDisable();
   }

   onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e.screen);
      for (const ship of this.ships.children) {
         if (
            pos.x > ship.position.x - ship.width / 2 &&
            pos.x < ship.position.x + ship.width / 2 &&
            pos.y > ship.position.y - ship.height / 2 &&
            pos.y < ship.position.y + ship.height / 2
         ) {
            console.log("hit");
         }
      }
   }
}
