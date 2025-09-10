import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import { getTechForBuilding } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { forEach } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "./utils/Global";

export function checkBuildingTextures(): void {
   forEach(Config.Buildings, (b, def) => {
      if (!G.textures.has(`Building/${b}`)) {
         if (getTechForBuilding(b)) {
            console.error(`Texture not found for Building: ${b}`);
         } else {
            console.warn(`Texture not found for Building: ${b}`);
         }
      }
      console.assert(G.textures.has(`Projectile/${def.code}`), `Texture not found for Projectile: ${def.code}`);
   });

   G.textures.forEach((_, key) => {
      if (key.startsWith("Building/")) {
         const building = key.replace("Building/", "") as Building;
         if (!Config.Buildings[building]) {
            console.warn(`Texture found for unknown Building: ${key}`);
         }
      }
   });
}
