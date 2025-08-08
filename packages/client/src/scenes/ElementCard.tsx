import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { hasPermanentElementUpgrade } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { type ElementSymbol, PeriodicTable } from "@spaceship-idle/shared/src/game/PeriodicTable";
import { capitalize } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { BitmapText, Container, type IDestroyOptions, Sprite } from "pixi.js";
import { Fonts } from "../assets";
import { ElementModal } from "../ui/ElementModal";
import { playClick, playError } from "../ui/Sound";
import { G } from "../utils/Global";
import { showModal } from "../utils/ToggleModal";
import { RedCircle } from "./RedCircle";

export class ElementCard extends Container {
   private _frame: Sprite;
   private _redCircle: RedCircle;
   private _content: Container;

   constructor(
      private readonly _elementSymbol: ElementSymbol,
      private readonly _tint: number = 0xffffff,
      private readonly _alpha: number = 0.5,
   ) {
      super();

      const element = PeriodicTable[_elementSymbol];

      this._frame = this.addChild(new Sprite(G.textures.get("Misc/ElementFrame")));
      this._frame.alpha = this._alpha;
      this._frame.tint = this._tint;

      this._content = this.addChild(new Container());

      const symbol = this._content.addChild(
         new BitmapText(element.symbol, {
            fontName: Fonts.SpaceshipIdle,
            fontSize: 96,
            tint: this._tint,
         }),
      );
      symbol.anchor.set(0.5, 0.5);
      symbol.position.set(100, 75);

      const name = this._content.addChild(
         new BitmapText(element.name(), {
            fontName: Fonts.SpaceshipIdle,
            fontSize: 24,
            tint: this._tint,
         }),
      );
      name.anchor.set(0.5, 0.5);
      name.position.set(100, 145);

      while (name.width > 180) {
         --name.fontSize;
      }

      const number = this._content.addChild(
         new BitmapText(element.atomicNumber, {
            fontName: Fonts.SpaceshipIdle,
            fontSize: 36,
            tint: this._tint,
         }),
      );
      number.anchor.set(0, 0.5);
      number.position.set(25, 25);

      const mass = this._content.addChild(
         new BitmapText(element.atomicMass, {
            fontName: Fonts.SpaceshipIdle,
            fontSize: 24,
            tint: this._tint,
         }),
      );
      mass.anchor.set(1, 0.5);
      mass.position.set(190, 20);

      const description = this._content.addChild(
         new BitmapText(`${capitalize(element.groupBlock)}    ${capitalize(element.standardState)}`, {
            fontName: Fonts.SpaceshipIdle,
            fontSize: 16,
            tint: this._tint,
         }),
      );

      while (description.width > 170) {
         --description.fontSize;
      }

      description.anchor.set(0.5, 0.5);
      description.position.set(90, 180);

      this._redCircle = this._content.addChild(new RedCircle());
      this._redCircle.position.set(190, 10);
      this._redCircle.toggle(false);
   }

   startListening() {
      GameStateUpdated.on(this.update.bind(this));
      this.update();
   }

   update() {
      const permanent = G.save.current.permanentElements.get(this._elementSymbol);
      const thisRun = G.save.current.elements.get(this._elementSymbol);
      if (permanent && hasPermanentElementUpgrade(permanent)) {
         this._redCircle?.toggle(true);
      } else if (thisRun && thisRun.amount > 0) {
         this._redCircle?.toggle(true);
      } else {
         this._redCircle?.toggle(false);
      }
      this._content.visible = !!permanent || !!thisRun;
   }

   destroy(options?: IDestroyOptions | boolean): void {
      super.destroy(options);
   }

   toggleSelect(selected: boolean) {
      if (selected) {
         this._frame.texture = G.textures.get("Misc/ElementFrameSelected")!;
         this._frame.tint = 0xfdcb6e;
         if (!this._content.visible) {
            playError();
            notifications.show({
               message: t(L.ElementNotDiscoveredYet),
               position: "top-center",
               color: "red",
               withBorder: true,
            });
         } else {
            playClick();
            showModal({
               children: <ElementModal symbol={this._elementSymbol} />,
               size: "lg",
               dismiss: true,
               title: (
                  <>
                     {PeriodicTable[this._elementSymbol].name()} ({PeriodicTable[this._elementSymbol].symbol})
                  </>
               ),
            });
         }
      } else {
         this._frame.texture = G.textures.get("Misc/ElementFrame")!;
         this._frame.tint = this._tint;
      }
   }
}
