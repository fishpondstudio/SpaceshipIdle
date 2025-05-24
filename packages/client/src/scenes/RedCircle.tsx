import { Container, Sprite } from "pixi.js";
import type { Action } from "../utils/actions/Action";
import { repeat, runFunc, sequence, to } from "../utils/actions/Actions";
import { Easing } from "../utils/actions/Easing";
import { G } from "../utils/Global";

export class RedCircle extends Container {
   private _action: Action;

   constructor() {
      super();
      const sprite = this.addChild(new Sprite(G.textures.get("Misc/Circle100")));
      sprite.anchor.set(0.5, 0.5);
      sprite.scale.set(0.3);
      sprite.tint = 0xe74c3c;
      sprite.alpha = 1;

      const spriteAnim = this.addChild(new Sprite(G.textures.get("Misc/Circle100")));
      spriteAnim.anchor.set(0.5, 0.5);
      spriteAnim.scale.set(0.4);
      spriteAnim.alpha = 0.7;
      spriteAnim.tint = 0xe74c3c;

      this._action = repeat(
         sequence(
            to(
               spriteAnim,
               {
                  scale: { x: 1, y: 1 },
                  alpha: 0,
               },
               1.5,
               Easing.OutCubic,
            ),
            runFunc(() => {
               spriteAnim.scale.set(0.4);
               spriteAnim.alpha = 0.7;
            }),
         ),
      ).start();
   }

   toggle(show: boolean) {
      if (show) {
         this.visible = true;
         this._action.start();
      } else {
         this.visible = false;
         this._action.stop();
      }
   }

   override destroy() {
      super.destroy();
      this._action.stop();
   }
}
