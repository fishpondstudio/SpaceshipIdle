import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import type { Galaxy, Planet, SolarSystem } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { generateCircles } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { drawDashedLine, rand, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { AABB } from "@spaceship-idle/shared/src/utils/Vector2";
import { type ColorSource, Container, type FederatedPointerEvent, Sprite } from "pixi.js";
import { GalaxyPage } from "../ui/GalaxyPage";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { G } from "../utils/Global";
import { type ISceneContext, Scene } from "../utils/SceneManager";

export class GalaxyScene extends Scene {
   private _graphics: SmoothGraphics;

   private _planetsContainer: Container<Sprite>;
   private _planets: Map<number, Sprite> = new Map();

   private _width = 16 * 200;
   private _height = 9 * 200;

   private _selectedId: number | null = null;

   private _galaxy: Galaxy = { solarSystems: [] };
   private _selector: Sprite;

   backgroundColor(): ColorSource {
      return 0x000000;
   }
   id(): string {
      return GalaxyScene.name;
   }

   constructor(context: ISceneContext) {
      super(context);

      const { app, textures } = this.context;

      const minZoom = Math.min(app.screen.width / this._width, app.screen.height / this._height);

      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.center = { x: this._width / 2, y: this._height / 2 };
      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.zoom = minZoom;

      this._graphics = this.viewport.addChild(new SmoothGraphics());

      this._planetsContainer = this.viewport.addChild(new Container<Sprite>());
      this._selector = this.viewport.addChild(new Sprite(textures.get("Misc/GalaxySelector")));
      this._selector.anchor.set(0.5);
      this._selector.scale.set(0.5);
      this._selector.visible = false;

      const count = rand(5, 10);
      const circles = generateCircles(
         new AABB({ x: 0.1 * this._width, y: 0.1 * this._height }, { x: 0.9 * this._width, y: 0.9 * this._height }),
         count,
         [200, Math.min(this._width, this._height) / 4],
      );

      let id = 0;
      for (const circle of circles) {
         const solarSystem: SolarSystem = {
            x: circle.x,
            y: circle.y,
            r: circle.r,
            planets: [],
         };

         let r = circle.r - rand(25, 50);

         while (r > 50) {
            const planet: Planet = {
               id: ++id,
               radian: Math.random() * 2 * Math.PI,
               r: r,
               speed: rand(-0.02, 0.02),
            };
            solarSystem.planets.push(planet);
            r -= rand(30, 70);
         }

         this._galaxy.solarSystems.push(solarSystem);
      }

      const textureCandidates = [
         textures.get("Others/Pirate24"),
         textures.get("Others/Spaceship24"),
         textures.get("Others/Alien"),
         textures.get("Others/Alien2"),
         textures.get("Others/Alien3"),
         textures.get("Others/Alien4"),
         textures.get("Others/Alien5"),
         textures.get("Others/Alien6"),
         textures.get("Others/Alien7"),
         textures.get("Others/Alien8"),
         textures.get("Others/Alien9"),
         textures.get("Others/Alien10"),
      ];
      let i = 0;

      for (const solarSystem of this._galaxy.solarSystems) {
         const star = this.viewport.addChild(new Sprite(textures.get("Others/Planet")));
         star.position.set(solarSystem.x, solarSystem.y);
         star.anchor.set(0.5);
         star.scale.set(2);

         for (const planet of solarSystem.planets) {
            const sprite = this._planetsContainer.addChild(
               new Sprite(textureCandidates[i++ % textureCandidates.length]),
            );
            sprite.anchor.set(0.5);
            this._planets.set(planet.id, sprite);
         }
      }
   }

   onEnable(): void {
      super.onEnable();
      G.pixi.ticker.add(() => {
         this._graphics.clear();
         const now = Date.now() / SECOND;

         for (const solarSystem of this._galaxy.solarSystems) {
            for (const planet of solarSystem.planets) {
               const sprite = this._planets.get(planet.id);
               if (sprite) {
                  const radian = planet.radian + now * planet.speed;
                  sprite.position.set(
                     solarSystem.x + Math.cos(radian) * planet.r,
                     solarSystem.y + Math.sin(radian) * planet.r,
                  );
                  if (sprite.texture === this.context.textures.get("Others/Spaceship24")) {
                     sprite.rotation = planet.speed > 0 ? radian + Math.PI : radian;
                  }
                  this._graphics.lineStyle({
                     width: 3,
                     color: 0xffffff,
                     alpha: 0.25,
                     alignment: 0.5,
                     scaleMode: LINE_SCALE_MODE.NONE,
                  });

                  drawDashedLine(
                     this._graphics,
                     { x: solarSystem.x, y: solarSystem.y },
                     { x: sprite.x, y: sprite.y },
                     3,
                     6,
                  );

                  if (this._selectedId === planet.id) {
                     this._graphics
                        .lineStyle({
                           width: sprite.width,
                           color: 0xffffff,
                           alpha: 0.1,
                           alignment: 0.5,
                           scaleMode: LINE_SCALE_MODE.NORMAL,
                        })
                        .drawCircle(solarSystem.x, solarSystem.y, planet.r);
                     this._selector.position.set(sprite.x, sprite.y);
                     this._selector.visible = true;
                     this._selector.alpha = Math.sin(now * Math.PI * 1.5) * 0.5 + 0.5;
                  }
               }
            }
         }
      });
   }

   onDisable(): void {
      super.onDisable();
   }

   onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e.screen);
      for (const [id, sprite] of this._planets) {
         if (
            pos.x > sprite.x - sprite.width / 2 &&
            pos.x < sprite.x + sprite.width / 2 &&
            pos.y > sprite.y - sprite.height / 2 &&
            pos.y < sprite.y + sprite.height / 2
         ) {
            setSidebar(<GalaxyPage />);
            this._selectedId = id;
            return;
         }
      }
      this._selectedId = null;
      hideSidebar();
   }
}
