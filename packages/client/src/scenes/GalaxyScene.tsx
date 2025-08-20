import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import {
   type Galaxy,
   type Planet,
   PlanetType,
   type SolarSystem,
} from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { packCircles } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { AABB } from "@spaceship-idle/shared/src/utils/AABB";
import { drawDashedLine, rand, randOne, SECOND, shuffle } from "@spaceship-idle/shared/src/utils/Helper";
import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import { type ColorSource, Container, type FederatedPointerEvent, Sprite } from "pixi.js";
import { GalaxyPage } from "../ui/GalaxyPage";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { G } from "../utils/Global";
import { type ISceneContext, Scene } from "../utils/SceneManager";

export class GalaxyScene extends Scene {
   private _graphics: SmoothGraphics;

   private _planetsContainer: Container<Sprite>;
   private _sprites: Map<number, Sprite> = new Map();

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

      this._graphics = this.viewport.addChild(new SmoothGraphics());

      this._planetsContainer = this.viewport.addChild(new Container<Sprite>());
      this._selector = this.viewport.addChild(new Sprite(textures.get("Misc/GalaxySelector")));
      this._selector.anchor.set(0.5);
      this._selector.scale.set(0.5);
      this._selector.visible = false;

      const circles = packCircles(
         [{ x: 0, y: 0, r: 300 }].concat(
            shuffle(
               [
                  { x: 0, y: 0, r: 500 },
                  { x: 0, y: 0, r: 400 },
                  { x: 0, y: 0, r: 400 },
                  { x: 0, y: 0, r: 300 },
                  { x: 0, y: 0, r: 250 },
                  { x: 0, y: 0, r: 250 },
               ],
               Math.random,
            ),
         ),
         Math.random,
      );

      const aabb = AABB.fromCircles(circles);
      aabb.extendBy({ x: aabb.width * 0.2, y: aabb.height * 0.2 });
      this._width = aabb.width;
      this._height = aabb.height;

      const offset = aabb.min;
      circles.forEach((circle) => {
         circle.x = circle.x - offset.x;
         circle.y = circle.y - offset.y;
      });

      const minZoom = Math.min(app.screen.width / this._width, app.screen.height / this._height);

      this.viewport.setWorldSize(this._width, this._height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.setWorldSize(this._width, this._height);

      let id = 0;
      let me: IHaveXY | null = null;
      for (let i = 0; i < circles.length; ++i) {
         const circle = circles[i];
         const initial = i === 0;
         const solarSystem: SolarSystem = {
            id: ++id,
            x: circle.x,
            y: circle.y,
            r: circle.r,
            discovered: initial,
            distance: 0,
            planets: [],
         };

         let r = circle.r - rand(25, 50);

         while (r >= 50) {
            const planet: Planet = {
               id: ++id,
               radian: Math.random() * 2 * Math.PI,
               r: r,
               speed: rand(-0.02, 0.02),
               type: randOne([PlanetType.Country, PlanetType.Pirate]),
            };
            solarSystem.planets.push(planet);
            r -= rand(30, 70);
         }

         if (initial) {
            const planet = randOne(solarSystem.planets);
            planet.type = PlanetType.Me;
            me = { x: solarSystem.x, y: solarSystem.y };
         }

         this._galaxy.solarSystems.push(solarSystem);
      }

      this._galaxy.solarSystems.sort((a, b) => {
         if (!me) return 0;
         return Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y);
      });

      for (let i = 0; i < this._galaxy.solarSystems.length; ++i) {
         const solarSystem = this._galaxy.solarSystems[i];
         if (i > 0) {
            solarSystem.distance = i;
         }
      }

      console.log(this._galaxy.solarSystems);

      const textureCandidates = [
         textures.get("Others/Pirate24"),
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
         this._sprites.set(solarSystem.id, star);

         for (const planet of solarSystem.planets) {
            const sprite = this._planetsContainer.addChild(
               new Sprite(
                  planet.type === PlanetType.Me
                     ? textures.get("Others/Spaceship24")
                     : textureCandidates[i++ % textureCandidates.length],
               ),
            );
            if (planet.type === PlanetType.Me) {
               me = { x: solarSystem.x, y: solarSystem.y };
               console.log(me);
               this._selectedId = planet.id;
            }
            sprite.anchor.set(0.5);
            this._sprites.set(planet.id, sprite);
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

            const star = this._sprites.get(solarSystem.id);
            if (star) {
               star.position.set(solarSystem.x, solarSystem.y);

               if (!solarSystem.discovered) {
                  star.texture = this.context.textures.get("Misc/GalaxyUndiscovered")!;
               }
            }

            for (const planet of solarSystem.planets) {
               const sprite = this._sprites.get(planet.id);
               if (sprite) {
                  const radian = planet.radian + now * planet.speed;
                  sprite.position.set(
                     solarSystem.x + Math.cos(radian) * planet.r,
                     solarSystem.y + Math.sin(radian) * planet.r,
                  );
                  if (sprite.texture === this.context.textures.get("Others/Spaceship24")) {
                     sprite.rotation = planet.speed > 0 ? radian + Math.PI : radian;
                  }

                  if (!solarSystem.discovered) {
                     sprite.visible = false;
                     continue;
                  }

                  sprite.visible = true;
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
      for (const [id, sprite] of this._sprites) {
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
