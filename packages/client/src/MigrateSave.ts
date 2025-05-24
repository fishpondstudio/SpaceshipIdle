import { Config } from "@spaceship-idle/shared/src/game/Config";
import { GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, type SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { isNullOrUndefined } from "@spaceship-idle/shared/src/utils/Helper";

export function migrateSave(save: SaveGame): void {
   save.current = Object.assign(new GameState(), save.current);
   save.options = Object.assign(new GameOption(), save.options);
   save.current.tiles.forEach((data, tile) => {
      if (!Config.Buildings[data.type]) {
         save.current.tiles.delete(tile);
      }
      if (isNullOrUndefined(data.capacity)) {
         data.capacity = 1;
      }
   });
   save.current.resources.forEach((value, key) => {
      if (!Config.Resources[key]) {
         save.current.resources.delete(key);
      }
   });
   save.current.unlockedTech.forEach((tech) => {
      if (!Config.Tech[tech]) {
         save.current.unlockedTech.delete(tech);
      }
   });
}
