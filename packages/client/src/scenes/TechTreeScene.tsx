import { LINE_SCALE_MODE, SmoothGraphics } from "@pixi/graphics-smooth";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { ShipClass, type Tech } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { getTechDesc, getTechName, isTechUnderDevelopment } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { equal, forEach, layoutSpaceBetween, numberToRoman } from "@spaceship-idle/shared/src/utils/Helper";
import { AABB, type IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import {
   type ColorSource,
   Container,
   type FederatedPointerEvent,
   LINE_CAP,
   LINE_JOIN,
   NineSlicePlane,
   Sprite,
} from "pixi.js";
import { Fonts } from "../assets";
import { hideSidebar, setSidebar } from "../ui/Sidebar";
import { playClick } from "../ui/Sound";
import { TechPage } from "../ui/TechPage";
import { WheelMode } from "../utils/Camera";
import { G } from "../utils/Global";
import { destroyAllChildren, type ISceneContext, Scene } from "../utils/SceneManager";
import { UnicodeText } from "../utils/UnicodeText";

const BoxWidth = 200;
const BoxHeight = 75;
const ColumnWidth = 400;
const PageHeight = 1000;
const HeaderHeight = 100;
const TopMargin = 40;
const BottomMargin = 40;
const BottomPadding = 100;
const Gap = 20;

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

      const rowCount = new Map<number, number>();

      forEach(Config.Tech, (_tech, def) => {
         const col = def.position.x;
         const count = rowCount.get(col) ?? 0;
         rowCount.set(col, count + 1);
      });

      const zoom = app.screen.height / (PageHeight * 1.05);
      const leftMargin = 320 / zoom;
      const width = rowCount.size * ColumnWidth + leftMargin * 2;
      const height = PageHeight;

      this.viewport.setWorldSize(width, PageHeight);
      this.viewport.zoom = zoom;
      this.viewport.wheelMode = WheelMode.HorizontalScroll;
      this.viewport.center = { x: 0, y: height / 2 };

      this._graphics = this.viewport.addChild(new SmoothGraphics());
      this._selectedGraphics = this.viewport.addChild(new SmoothGraphics());
      this._boxContainer = this.viewport.addChild(new Container());
      this._selectedBoxContainer = this.viewport.addChild(new Container());

      forEach(ShipClass, (_shipClass, def) => {
         const x = def.range[0] * ColumnWidth + Gap + leftMargin;
         const y = TopMargin;
         const frame = this._boxContainer.addChild(
            new NineSlicePlane(G.textures.get("Misc/ClassFrame")!, 90, 90, 90, 90),
         );
         frame.position.set(x, y);
         frame.width = (def.range[1] - def.range[0] + 1) * ColumnWidth - Gap;
         frame.height = PageHeight - BottomMargin - TopMargin;
         frame.alpha = 0.5;

         const name = this.viewport.addChild(
            new UnicodeText(def.name().toUpperCase(), {
               fontName: Fonts.SpaceshipIdleBold,
               fontSize: 28,
               tint: 0xffffff,
               letterSpacing: 28,
            }),
         );
         name.anchor.set(0.5);
         name.position.set(x + frame.width / 2, y + 20);
      });

      forEach(Config.Tech, (tech, def) => {
         const x = def.position.x * ColumnWidth + ColumnWidth / 2 - BoxWidth / 2 + leftMargin;
         const totalRow = rowCount.get(def.position.x) ?? 1;
         const totalHeight = PageHeight - BottomMargin - TopMargin - HeaderHeight - BottomPadding;
         let y = HeaderHeight + layoutSpaceBetween(BoxHeight, totalHeight, totalRow, def.position.y) + BoxHeight / 2;
         if (totalRow === 2) {
            y =
               (layoutSpaceBetween(BoxHeight, totalHeight, 4, def.position.y * 2) +
                  layoutSpaceBetween(BoxHeight, totalHeight, 4, def.position.y * 2 + 1)) /
                  2 +
               HeaderHeight +
               BoxHeight / 2;
         }

         const container = this._boxContainer.addChild(new Container());
         container.position.set(x, y);
         container.width = BoxWidth;
         container.height = BoxHeight;

         const frame = container.addChild(new Sprite(G.textures.get("Misc/TechFrame")));
         frame.position.set(0, 0);
         frame.width = BoxWidth;
         frame.height = BoxHeight;

         frame.alpha = 0.5;
         const tier = container.addChild(
            new UnicodeText(numberToRoman(def.position.x + 1) ?? "", {
               fontName: Fonts.SpaceshipIdle,
               fontSize: 16,
               tint: 0xffffff,
            }),
         );
         tier.anchor.set(1, 0);
         tier.position.set(BoxWidth - 4, 2);

         if (import.meta.env.DEV) {
            const id = container.addChild(
               new UnicodeText(tech, {
                  fontName: Fonts.SpaceshipIdle,
                  fontSize: 16,
                  tint: 0xffffff,
               }),
            );
            id.anchor.set(0, 1);
            id.position.set(6, BoxHeight - 8);
         }

         if (!isTechUnderDevelopment(tech)) {
            const text = container.addChild(
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
            text.position.set(BoxWidth / 2, BoxHeight / 2 - 10);

            const desc = container.addChild(
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
            desc.position.set(BoxWidth / 2, BoxHeight / 2 + 10);
         }

         this._techs.set(tech, new AABB({ x: x, y: y }, { x: x + BoxWidth, y: y + BoxHeight }));
      });

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
      const diff = {
         x: equal(fromCenter.x, toCenter.x) ? 0 : Math.sign(dx),
         y: 0,
      };

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
