import { type Planet, PlanetType, type SolarSystem } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
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

export class SolarSystemVisual extends GalaxyEntityVisual {
   constructor(public data: SolarSystem) {
      const sprite = new Sprite(
         data.discovered ? G.textures.get("Others/Planet")! : G.textures.get("Misc/GalaxyUndiscovered")!,
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

const stateTextures = () => [
   G.textures.get("Others/Alien"),
   G.textures.get("Others/Alien2"),
   G.textures.get("Others/Alien3"),
   G.textures.get("Others/Alien4"),
   G.textures.get("Others/Alien5"),
   G.textures.get("Others/Alien6"),
   G.textures.get("Others/Alien7"),
   G.textures.get("Others/Alien8"),
   G.textures.get("Others/Alien9"),
   G.textures.get("Others/Alien10"),
];

export class PlanetVisual extends GalaxyEntityVisual {
   constructor(public data: Planet) {
      const textures = stateTextures();
      const sprite = new Sprite(textures[data.id % textures.length]);
      if (data.type === PlanetType.Pirate) {
         sprite.texture = G.textures.get("Others/Pirate24")!;
      }
      if (data.type === PlanetType.Me) {
         sprite.texture = G.textures.get("Others/Spaceship24")!;
      }
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
