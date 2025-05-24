import { Config } from "@spaceship-idle/shared/src/game/Config";
import { WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { forEach } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "./utils/Global";

export function checkBuildingTextures(): void {
   forEach(Config.Buildings, (b, def) => {
      console.assert(G.textures.has(`Building/${b}`), `Texture not found for Building: ${b}`);
      if (WeaponKey in def) {
         console.assert(G.textures.has(`Projectile/${def.code}`), `Texture not found for Projectile: ${def.code}`);
      }
   });

   G.textures.forEach((texture, key) => {
      if (key.startsWith("Building/")) {
         const building = key.replace("Building/", "") as Building;
         console.assert(Config.Buildings[building], `Texture found for unknown Building: ${key}`);
      }
   });
}
