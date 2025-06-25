import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DefaultShortcuts, GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, type SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { isBooster } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { isNullOrUndefined } from "@spaceship-idle/shared/src/utils/Helper";

export function migrateSave(save: SaveGame): void {
   if ("elements" in save.options) {
      // @ts-expect-error
      save.current.permanentElements = save.options.elements;
      delete save.options.elements;
   }
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
   save.current = Object.assign(new GameState(), save.current);
   save.options = Object.assign(new GameOption(), save.options);
   save.options.shortcuts = Object.assign({}, DefaultShortcuts, save.options.shortcuts);
   save.current.tiles.forEach((data, tile) => {
      if (!Config.Buildings[data.type]) {
         save.current.tiles.delete(tile);
      }
      if (isNullOrUndefined(data.capacity)) {
         data.capacity = 1;
      }
      if (isBooster(data.type)) {
         data.level = 1;
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
