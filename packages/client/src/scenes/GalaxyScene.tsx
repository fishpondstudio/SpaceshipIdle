import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { type Galaxy, PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { generateGalaxy } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { drawDashedLine, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import { type ColorSource, Container, type FederatedPointerEvent, Sprite } from "pixi.js";
import { GalaxyPage } from "../ui/GalaxyPage";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { G } from "../utils/Global";
import { type ISceneContext, Scene } from "../utils/SceneManager";
import { type GalaxyEntityVisual, PlanetVisual, SolarSystemVisual } from "./GalaxyEntity";

export class GalaxyScene extends Scene {
   private _graphics: SmoothGraphics;

   private _planetsContainer: Container<GalaxyEntityVisual>;
   private _entities = new Map<number, GalaxyEntityVisual>();

   private _width = 16 * 200;
   private _height = 9 * 200;

   private _selectedId: number | null = null;

   private _galaxy: Galaxy;
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

      this._graphics = this.viewport.addChild(new SmoothGraphics());

      this._planetsContainer = this.viewport.addChild(new Container<GalaxyEntityVisual>());
      this._selector = this.viewport.addChild(new Sprite(textures.get("Misc/GalaxySelector")));
      this._selector.anchor.set(0.5);
      this._selector.visible = false;

      const [galaxy, aabb] = generateGalaxy(Math.random);
      this._galaxy = galaxy;

      this._width = aabb.width;
      this._height = aabb.height;

      const minZoom = Math.min(app.screen.width / this._width, app.screen.height / this._height);

      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.setWorldSize(this._width, this._height);

      let me: IHaveXY | null = null;

      for (const solarSystem of galaxy.solarSystems) {
         const star = this.viewport.addChild(new SolarSystemVisual(solarSystem));
         star.position.set(solarSystem.x, solarSystem.y);
         this._entities.set(solarSystem.id, star);

         for (const planet of solarSystem.planets) {
            const entity = this._planetsContainer.addChild(new PlanetVisual(planet));
            if (planet.type === PlanetType.Me) {
               me = { x: solarSystem.x, y: solarSystem.y };
               this._selectedId = planet.id;
            }
            this._entities.set(planet.id, entity);
         }
      }

      if (me) {
         this.viewport.center = { x: me.x, y: me.y };
         this.viewport.zoom = 1;
         setSidebar(<GalaxyPage />);
      }
   }

   onEnable(): void {
      super.onEnable();
      G.pixi.ticker.add(() => {
         this._graphics.clear();
         const now = Date.now() / SECOND;

         let selectorRendered = false;

         for (const solarSystem of this._galaxy.solarSystems) {
            // this._graphics
            //    .lineStyle({
            //       width: 2,
            //       color: 0xffffff,
            //       alpha: 0.25,
            //       alignment: 0.5,
            //       scaleMode: LINE_SCALE_MODE.NONE,
            //    })
            //    .drawCircle(solarSystem.x, solarSystem.y, solarSystem.r);

            const star = this._entities.get(solarSystem.id);
            if (star) {
               star.position.set(solarSystem.x, solarSystem.y);

               if (this._selectedId === solarSystem.id) {
                  this._selector.position.set(star.x, star.y);
                  this._selector.visible = true;
                  this._selector.scale.set(0.48);
                  this._selector.alpha = Math.sin(now * Math.PI * 1.5) * 0.5 + 0.5;
                  selectorRendered = true;
               }
            }

            for (const planet of solarSystem.planets) {
               const visual = this._entities.get(planet.id);
               if (visual) {
                  const radian = planet.radian + now * planet.speed;
                  visual.position.set(
                     solarSystem.x + Math.cos(radian) * planet.r,
                     solarSystem.y + Math.sin(radian) * planet.r,
                  );
                  if (planet.type === PlanetType.Me) {
                     visual.sprite.rotation = planet.speed > 0 ? radian + Math.PI : radian;
                  }

                  if (!solarSystem.discovered) {
                     visual.visible = false;
                     continue;
                  }

                  visual.visible = true;
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
                     { x: visual.x, y: visual.y },
                     3,
                     6,
                  );

                  if (this._selectedId === planet.id) {
                     this._graphics
                        .lineStyle({
                           width: visual.sprite.width,
                           color: 0xffffff,
                           alpha: 0.1,
                           alignment: 0.5,
                           scaleMode: LINE_SCALE_MODE.NORMAL,
                        })
                        .drawCircle(solarSystem.x, solarSystem.y, planet.r);
                     this._selector.position.set(visual.x, visual.y);
                     this._selector.visible = true;
                     this._selector.scale.set(0.28);
                     this._selector.alpha = Math.sin(now * Math.PI * 1.5) * 0.5 + 0.5;
                     selectorRendered = true;
                  }
               }
            }
         }

         if (!selectorRendered) {
            this._selector.visible = false;
         }
      });
   }

   onDisable(): void {
      super.onDisable();
   }

   onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e.screen);
      for (const [id, sprite] of this._entities) {
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
