import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { type ColorSource, Container, type FederatedPointerEvent, Sprite } from "pixi.js";
import { GalaxyPage } from "../ui/GalaxyPage";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { type ISceneContext, Scene } from "../utils/SceneManager";

export class GalaxyScene extends Scene {
   private graphics: SmoothGraphics;
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
         alpha: 0.15,
         alignment: 0,
         scaleMode: LINE_SCALE_MODE.NONE,
      });

      this.ships = this.viewport.addChild(new Container<Sprite>());

      const galaxy = this.viewport.addChild(new Sprite(this.context.textures.get("Others/Galaxy")));
      galaxy.position.set(this.size / 2, this.size / 2);
      galaxy.anchor.set(0.5);
      galaxy.scale.set(2);

      let r = Math.random() * 2 * Math.PI;
      this.graphics.drawCircle(this.size / 2, this.size / 2, 100);
      const ship = this.ships.addChild(new Sprite(this.context.textures.get("Others/Pirate")));
      ship.anchor.set(0.5);
      ship.position.set(this.size / 2 + Math.cos(r) * 100, this.size / 2 + Math.sin(r) * 100);
      // ship.rotation = r;

      r = Math.random() * 2 * Math.PI;
      const ship2 = this.ships.addChild(new Sprite(this.context.textures.get("Others/Alien")));
      this.graphics.drawCircle(this.size / 2, this.size / 2, 150);
      ship2.anchor.set(0.5);
      ship2.position.set(this.size / 2 + Math.cos(r) * 150, this.size / 2 + Math.sin(r) * 150);

      r = Math.random() * 2 * Math.PI;
      const ship3 = this.ships.addChild(new Sprite(this.context.textures.get("Others/Alien2")));
      this.graphics.drawCircle(this.size / 2, this.size / 2, 200);
      ship3.anchor.set(0.5);
      ship3.position.set(this.size / 2 + Math.cos(r) * 200, this.size / 2 + Math.sin(r) * 200);

      const selector = this.ships.addChild(new Sprite(this.context.textures.get("Misc/GalaxySelector")));
      selector.anchor.set(0.5);
      selector.scale.set(0.5);
      selector.position.set(this.size / 2 + Math.cos(r) * 200, this.size / 2 + Math.sin(r) * 200);
   }

   onEnable(): void {
      super.onEnable();
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
            setSidebar(<GalaxyPage />);
            return;
         }
      }
      hideSidebar();
   }
}
