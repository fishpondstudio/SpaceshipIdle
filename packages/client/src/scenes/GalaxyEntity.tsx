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
   constructor(public data: StarSystem) {
      const sprite = new Sprite(
         data.discovered ? G.textures.get(`Galaxy/${data.texture}`)! : G.textures.get("Misc/GalaxyUndiscovered")!,
      );
      if (data.discovered) {
         sprite.scale.set(2);
      }
      const label = new BitmapText(data.name, {
         fontName: Fonts.SpaceshipIdle,
         fontSize: 12,
         tint: 0xffffff,
      });
      super(sprite, label);
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
