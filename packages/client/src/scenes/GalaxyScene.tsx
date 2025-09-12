import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { PlanetType } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { AABB } from "@spaceship-idle/shared/src/utils/AABB";
import { drawDashedLine, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import { type ColorSource, Container, type FederatedPointerEvent, Sprite } from "pixi.js";
import { GalaxyPage } from "../ui/GalaxyPage";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { playClick } from "../ui/Sound";
import { G } from "../utils/Global";
import { type ISceneContext, Scene } from "../utils/SceneManager";
import { type GalaxyEntityVisual, PlanetVisual, StarSystemVisual } from "./GalaxyEntity";

export class GalaxyScene extends Scene {
   private _graphics: SmoothGraphics;

   private _planetsContainer: Container<GalaxyEntityVisual>;
   private _entities = new Map<number, GalaxyEntityVisual>();

   private _width = 16 * 200;
   private _height = 9 * 200;

   private _selectedId: number | null = null;

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

      const aabb = AABB.fromCircles(G.save.data.galaxy.starSystems);
      aabb.extendBy({ x: aabb.width * 0.2, y: aabb.height * 0.2 });
      this._width = aabb.width;
      this._height = aabb.height;

      const minZoom = Math.min(app.screen.width / this._width, app.screen.height / this._height);

      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.setWorldSize(this._width, this._height);

      let me: IHaveXY | null = null;

      for (const starSystem of G.save.data.galaxy.starSystems) {
         const star = this.viewport.addChild(new StarSystemVisual(starSystem));
         star.position.set(starSystem.x, starSystem.y);
         this._entities.set(starSystem.id, star);

         for (const planet of starSystem.planets) {
            const entity = this._planetsContainer.addChild(new PlanetVisual(planet));
            if (planet.type === PlanetType.Me) {
               me = { x: starSystem.x, y: starSystem.y };
               this._selectedId = planet.id;
            }
            this._entities.set(planet.id, entity);
         }
      }

      if (me) {
         this.viewport.center = { x: me.x, y: me.y };
         this.viewport.zoom = 1;
         if (this._selectedId) {
            setSidebar(<GalaxyPage id={this._selectedId} />);
         }
      }
   }

   onEnable(): void {
      super.onEnable();
      if (this._selectedId) {
         setSidebar(<GalaxyPage id={this._selectedId} />);
      }
   }

   render(): void {
      this._graphics.clear();
      const now = Date.now() / SECOND;

      let selectorRendered = false;

      for (const starSystem of G.save.data.galaxy.starSystems) {
         // this._graphics
         //    .lineStyle({
         //       width: 2,
         //       color: 0xffffff,
         //       alpha: 0.25,
         //       alignment: 0.5,
         //       scaleMode: LINE_SCALE_MODE.NONE,
         //    })
         //    .drawCircle(solarSystem.x, solarSystem.y, solarSystem.r);

         const star = this._entities.get(starSystem.id) as StarSystemVisual;
         if (star) {
            star.position.set(starSystem.x, starSystem.y);
            star.discovered = starSystem.discovered;

            if (this._selectedId === starSystem.id) {
               this._selector.position.set(star.x, star.y);
               this._selector.visible = true;
               this._selector.scale.set(0.48);
               this._selector.alpha = Math.sin(now * Math.PI * 1.5) * 0.5 + 0.5;
               selectorRendered = true;
            }
         }

         for (const planet of starSystem.planets) {
            const visual = this._entities.get(planet.id);
            if (!visual) {
               continue;
            }
            const radian = planet.radian + now * planet.speed;
            visual.position.set(starSystem.x + Math.cos(radian) * planet.r, starSystem.y + Math.sin(radian) * planet.r);
            if (planet.type === PlanetType.Me) {
               visual.sprite.rotation = planet.speed > 0 ? radian + Math.PI : radian;
            }

            if (!starSystem.discovered) {
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

            drawDashedLine(this._graphics, { x: starSystem.x, y: starSystem.y }, { x: visual.x, y: visual.y }, 3, 6);

            if (this._selectedId === planet.id) {
               this._graphics
                  .lineStyle({
                     width: visual.sprite.width,
                     color: 0xffffff,
                     alpha: 0.1,
                     alignment: 0.5,
                     scaleMode: LINE_SCALE_MODE.NORMAL,
                  })
                  .drawCircle(starSystem.x, starSystem.y, planet.r);
               this._selector.position.set(visual.x, visual.y);
               this._selector.visible = true;
               this._selector.scale.set(0.28);
               this._selector.alpha = Math.sin(now * Math.PI * 1.5) * 0.5 + 0.5;
               selectorRendered = true;
            }
         }
      }

      if (!selectorRendered) {
         this._selector.visible = false;
      }
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
            playClick();
            this.select(id);
            return;
         }
      }
      this._selectedId = null;
      hideSidebar();
   }

   lookAt(planetId: number): GalaxyScene {
      const entity = this._entities.get(planetId);
      if (entity) {
         this.viewport.center = { x: entity.x, y: entity.y };
      }
      return this;
   }

   select(planetId: number): GalaxyScene {
      this._selectedId = planetId;
      setSidebar(<GalaxyPage id={planetId} />);
      return this;
   }
}
