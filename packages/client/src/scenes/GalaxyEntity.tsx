import { type Planet, PlanetType, type StarSystem } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { BitmapText, Container, Sprite } from "pixi.js";
import { Fonts } from "../assets";
import { G } from "../utils/Global";

export class GalaxyEntityVisual extends Container {
   constructor(
      public sprite: Sprite,
      public label: BitmapText,
   ) {
      super();
      this.addChild(this.sprite);
      this.sprite.anchor.set(0.5);
      this.addChild(this.label);
      this.label.anchor.set(0.5, 0);
      this.label.position.set(0, this.sprite.height / 2);
   }
}

export class StarSystemVisual extends GalaxyEntityVisual {
   private _discovered = false;

   constructor(public data: StarSystem) {
      const sprite = new Sprite();
      const label = new BitmapText(data.name, {
         fontName: Fonts.SpaceshipIdle,
         fontSize: 12,
         tint: 0xffffff,
      });
      super(sprite, label);

      this._discovered = data.discovered;
      this.updateVisual();
   }

   public set discovered(value: boolean) {
      if (this._discovered === value) {
         return;
      }
      this._discovered = value;
      this.updateVisual();
   }

   private updateVisual() {
      this.sprite.texture = this._discovered
         ? G.textures.get(`Galaxy/${this.data.texture}`)!
         : G.textures.get("Misc/GalaxyUndiscovered")!;
      if (this._discovered) {
         this.sprite.scale.set(2);
      } else {
         this.sprite.scale.set(1);
      }
      this.label.position.set(0, this.sprite.height / 2);
   }
}

export class PlanetVisual extends GalaxyEntityVisual {
   constructor(public data: Planet) {
      const texture = G.textures.get(`Galaxy/${data.texture}`);
      if (!texture) {
         console.error(`Texture Galaxy/${data.texture} not found`);
      }
      const sprite = new Sprite(texture);
      const label =
         data.type === PlanetType.Me
            ? new BitmapText("You", {
                 fontName: Fonts.SpaceshipIdle,
                 fontSize: 12,
                 tint: 0xffeaa7,
              })
            : new BitmapText(data.name, {
                 fontName: Fonts.SpaceshipIdle,
                 fontSize: 12,
                 tint: 0xffffff,
              });
      super(sprite, label);
   }
}
