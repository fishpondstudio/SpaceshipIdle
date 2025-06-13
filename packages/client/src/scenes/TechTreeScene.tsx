import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Tech } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { getTechDesc, getTechName, isTechUnderDevelopment } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { equal, forEach, mapSafePush, numberToRoman } from "@spaceship-idle/shared/src/utils/Helper";
import { AABB, type IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import { Container, LINE_CAP, LINE_JOIN, Sprite, type ColorSource, type FederatedPointerEvent } from "pixi.js";
import { Fonts } from "../assets";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { playClick } from "../ui/Sound";
import { TechPage } from "../ui/TechPage";
import { G } from "../utils/Global";
import { destroyAllChildren, Scene, type ISceneContext } from "../utils/SceneManager";
import { UnicodeText } from "../utils/UnicodeText";

const BoxWidth = 200;
const BoxHeight = 75;
const Radius = 250;

export class TechTreeScene extends Scene {
   private _graphics: SmoothGraphics;
   private _selectedGraphics: SmoothGraphics;
   private _techs = new Map<Tech, AABB>();
   private _boxContainer: Container;
   private _selectedBoxContainer: Container;

   backgroundColor(): ColorSource {
      return 0x000000;
   }

   id(): string {
      return TechTreeScene.name;
   }

   constructor(context: ISceneContext) {
      super(context);
      const { app, textures } = this.context;

      const width = 5000;
      const height = 5000;

      const minZoom = Math.min(app.screen.width / width, app.screen.height / height);
      this.viewport.setWorldSize(width, height);
      this.viewport.setZoomRange(minZoom, 2);
      this.viewport.center = { x: width / 2, y: height / 2 };
      this.viewport.setWorldSize(width, height);

      // const bg = this.viewport.addChild(new Sprite(Texture.WHITE));
      // bg.position.set(0, 0);
      // bg.width = width;
      // bg.height = height;
      // bg.tint = 0x000000;

      this._graphics = this.viewport.addChild(new SmoothGraphics());
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._boxContainer = this.viewport.addChild(new Container());
      this._selectedBoxContainer = this.viewport.addChild(new Container());

      const techByRing = new Map<number, Tech[]>();
      let maxRing = 0;

      forEach(Config.Tech, (tech, def) => {
         if (def.ring > maxRing) {
            maxRing = def.ring;
         }
         mapSafePush(techByRing, def.ring, tech);
      });

      for (let ring = 0; ring <= maxRing; ring++) {
         const techs = techByRing.get(ring);
         if (techs) {
            for (let i = 0; i < techs.length; i++) {
               const tech = techs[i];
               const angle = (i * 2 * Math.PI) / techs.length - Math.PI / 2;
               const x = Math.cos(angle) * Radius * ring;
               const y = Math.sin(angle) * Radius * ring;
               const frame = this._boxContainer.addChild(new Sprite(G.textures.get("Misc/TechFrame")));
               frame.anchor.set(0.5);
               frame.position.set(width / 2 + x, height / 2 + y);
               frame.alpha = 0.5;
               const tier = this.viewport.addChild(
                  new UnicodeText(numberToRoman(ring) ?? "", {
                     fontName: Fonts.SpaceshipIdle,
                     fontSize: 16,
                     tint: 0xffffff,
                  }),
               );
               tier.anchor.set(1, 0);
               tier.position.set(width / 2 + x + BoxWidth / 2 - 4, height / 2 + y - BoxHeight / 2 + 2);

               if (import.meta.env.DEV) {
                  const id = this.viewport.addChild(
                     new UnicodeText(numberToRoman(ring) ?? "", {
                        fontName: Fonts.SpaceshipIdle,
                        fontSize: 16,
                        tint: 0xffffff,
                     }),
                  );
                  id.text = tech;
                  id.anchor.set(0, 1);
                  id.position.set(width / 2 + x - BoxWidth / 2 + 6, height / 2 + y + BoxHeight / 2 - 8);
               }

               if (!isTechUnderDevelopment(tech)) {
                  const text = this.viewport.addChild(
                     new UnicodeText(getTechName(tech), {
                        fontName: Fonts.SpaceshipIdle,
                        fontSize: 20,
                        tint: 0xffffff,
                     }),
                  );
                  while (text.width > BoxWidth - 20) {
                     text.size--;
                  }
                  text.anchor.set(0.5);
                  text.position.set(width / 2 + x, height / 2 + y - 14);

                  const desc = this.viewport.addChild(
                     new UnicodeText(getTechDesc(tech), {
                        fontName: Fonts.SpaceshipIdle,
                        fontSize: 14,
                        tint: 0xffffff,
                     }),
                  );
                  while (desc.width > BoxWidth - 20) {
                     desc.size--;
                  }
                  desc.anchor.set(0.5);
                  desc.position.set(width / 2 + x, height / 2 + y + 10);
               }

               this._techs.set(
                  tech,
                  new AABB(
                     { x: width / 2 + x - BoxWidth / 2, y: height / 2 + y - BoxHeight / 2 },
                     { x: width / 2 + x + BoxWidth / 2, y: height / 2 + y + BoxHeight / 2 },
                  ),
               );
            }
         }
      }

      this.drawSelected();

      forEach(Config.Tech, (tech, def) => {
         const from = this._techs.get(tech);
         if (!from) {
            return;
         }
         this._graphics.lineStyle({
            width: 3,
            color: 0xffffff,
            alignment: 0.5,
            join: LINE_JOIN.ROUND,
            cap: LINE_CAP.ROUND,
            alpha: 0.25,
            scaleMode: LINE_SCALE_MODE.NONE,
         });
         def.requires.forEach((t) => {
            const dep = this._techs.get(t);
            if (!dep) {
               return;
            }
            this.drawConnection(this._graphics, from, dep);
         });
      });

      // G.pixi.renderer.extract.image(this.viewport).then((image) => {
      //    image.style.position = "absolute";
      //    image.style.top = "0";
      //    image.style.left = "0";
      //    document.body.appendChild(image);
      // });

      // this.viewport.zoom = 0.5;
   }

   public refresh(): void {
      this.drawSelected();
   }

   private drawSelected(tech?: Tech): void {
      this._selectedGraphics.clear();
      destroyAllChildren(this._selectedBoxContainer);
      G.save.current.unlockedTech.forEach((t) => {
         const frame = this._selectedBoxContainer.addChild(new Sprite(G.textures.get("Misc/TechFrame")));
         frame.tint = 0xfdcb6e;
         this.drawSelectedTech(t, frame, true);
      });
      if (tech) {
         const frame = this._selectedBoxContainer.addChild(new Sprite(G.textures.get("Misc/TechFrameSelected")));
         this.drawSelectedTech(tech, frame, !G.save.current.unlockedTech.has(tech));
         if (isTechUnderDevelopment(tech)) {
            hideSidebar();
         } else {
            setSidebar(<TechPage tech={tech} />);
         }
      }
   }

   private drawSelectedTech(tech: Tech, frame: Sprite, drawConnection: boolean): void {
      const box = this._techs.get(tech);
      if (!box) {
         return;
      }
      frame.anchor.set(0.5);
      frame.position.set(box.center.x, box.center.y);
      frame.alpha = 1;
      const to = this._techs.get(tech);
      this._selectedGraphics.lineStyle({
         width: 3,
         color: 0xfdcb6e,
         alignment: 0.5,
         join: LINE_JOIN.ROUND,
         cap: LINE_CAP.ROUND,
         alpha: 1,
         scaleMode: LINE_SCALE_MODE.NONE,
      });
      if (drawConnection) {
         Config.Tech[tech].requires.forEach((r) => {
            const from = this._techs.get(r);
            if (from && to) {
               this.drawConnection(this._selectedGraphics, from, to);
            }
         });
      }
   }

   override onClicked(e: FederatedPointerEvent): void {
      const pos = this.viewport.screenToWorld(e.screen);
      const tech = this.getTechByPosition(pos);
      if (tech) {
         playClick();
         this.drawSelected(tech);
      }
   }

   private getTechByPosition(pos: IHaveXY): Tech | undefined {
      for (const [tech, box] of this._techs) {
         if (box.contains(pos)) {
            return tech;
         }
      }
   }

   private drawConnection(g: SmoothGraphics, from: AABB, to: AABB): void {
      const fromCenter = from.center;
      const toCenter = to.center;
      const dx = toCenter.x - fromCenter.x;
      const dy = toCenter.y - fromCenter.y;
      const diff = {
         x: equal(fromCenter.x, toCenter.x) ? 0 : Math.sign(dx),
         y: equal(fromCenter.y, toCenter.y) ? 0 : Math.sign(dy),
      };

      if (Math.abs(dx) > Math.abs(dy)) {
         diff.y = 0;
      }
      if (Math.abs(dx) < Math.abs(dy)) {
         diff.x = 0;
      }

      diff.x *= BoxWidth / 2 + 10;
      diff.y *= BoxHeight / 2 + 10;

      g.moveTo(fromCenter.x + diff.x, fromCenter.y + diff.y);
      if (diff.x === 0) {
         g.bezierCurveTo(
            fromCenter.x + diff.x,
            (fromCenter.y + toCenter.y) / 2,
            toCenter.x - diff.x,
            (fromCenter.y + toCenter.y) / 2,
            toCenter.x - diff.x,
            toCenter.y - diff.y,
         );
      } else {
         g.bezierCurveTo(
            (fromCenter.x + toCenter.x) / 2,
            fromCenter.y + diff.y,
            (fromCenter.x + toCenter.x) / 2,
            toCenter.y - diff.y,
            toCenter.x - diff.x,
            toCenter.y - diff.y,
         );
      }
   }
}
