import { Config } from "@spaceship-idle/shared/src/game/Config";
import { DefaultShortcuts, GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, type SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { migrateBuildingsAndResources } from "@spaceship-idle/shared/src/game/logic/ShipLogic";

export function migrateSave(save: SaveGame): void {
   if ("elementChoices" in save.options) {
      // @ts-expect-error
      save.state.permanentElementChoices = save.options.elementChoices;
      delete save.options.elementChoices;
   }
   if ("battleCount" in save.state) {
      // @ts-expect-error
      save.state.win = save.state.battleCount;
      delete save.state.battleCount;
   }
   if ("trialCount" in save.state) {
      // @ts-expect-error
      save.state.loss = save.state.trialCount;
      delete save.state.trialCount;
   }
   migrateBuildingsAndResources(save.state);
   save.state = Object.assign(new GameState(), save.state);
   save.options = Object.assign(new GameOption(), save.options);
   save.options.shortcuts = Object.assign({}, DefaultShortcuts, save.options.shortcuts);

   save.state.tiles.forEach((data, tile) => {
      if (!Config.Buildings[data.type]) {
         save.state.tiles.delete(tile);
      }
   });
   save.state.resources.forEach((value, key) => {
      if (!Config.Resources[key]) {
         save.state.resources.delete(key);
      }
   });
   save.state.unlockedTech.forEach((tech) => {
      if (!Config.Tech[tech]) {
         save.state.unlockedTech.delete(tech);
      }
   });
}
