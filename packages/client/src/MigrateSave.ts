import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DefaultShortcuts, GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, type SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { migrateBuildingsAndResources } from "@spaceship-idle/shared/src/game/logic/ShipLogic";

export function migrateSave(save: SaveGame): void {
   if ("elementChoices" in save.options) {
      // @ts-expect-error
      save.current.permanentElementChoices = save.options.elementChoices;
      delete save.options.elementChoices;
   }
   if ("battleCount" in save.current) {
      // @ts-expect-error
      save.current.win = save.current.battleCount;
      delete save.current.battleCount;
   }
   if ("trialCount" in save.current) {
      // @ts-expect-error
      save.current.loss = save.current.trialCount;
      delete save.current.trialCount;
   }
   migrateBuildingsAndResources(save.current);
   save.current = Object.assign(new GameState(), save.current);
   save.options = Object.assign(new GameOption(), save.options);
   save.options.shortcuts = Object.assign({}, DefaultShortcuts, save.options.shortcuts);

   save.current.tiles.forEach((data, tile) => {
      if (!Config.Buildings[data.type]) {
         save.current.tiles.delete(tile);
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
