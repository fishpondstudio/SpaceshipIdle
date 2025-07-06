import { Config } from "@spaceship-idle/shared/src/game/Config";
import { WeaponKey } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import { DefaultShortcuts, GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { GameState, type Inventory, type SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { isBooster } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { revertElementUpgrade } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { migrateBuildingsAndResources } from "@spaceship-idle/shared/src/game/logic/ShipLogic";
import type { ElementSymbol } from "@spaceship-idle/shared/src/game/PeriodicTable";
import { isNullOrUndefined } from "@spaceship-idle/shared/src/utils/Helper";

export function migrateSave(save: SaveGame): void {
   if ("elements" in save.options) {
      const old = save.options.elements as Map<ElementSymbol, Inventory>;
      save.current.permanentElements = new Map();
      for (const [symbol, inventory] of old) {
         save.current.permanentElements.set(symbol, {
            amount: inventory.amount,
            production: 0,
            xp: inventory.level,
         });
      }
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
   migrateBuildingsAndResources(save.current);
   save.current = Object.assign(new GameState(), save.current);
   save.options = Object.assign(new GameOption(), save.options);
   save.options.shortcuts = Object.assign({}, DefaultShortcuts, save.options.shortcuts);

   save.current.permanentElements.forEach((data, symbol) => {
      const building = Config.Elements.get(symbol);
      if (building) {
         const def = Config.Buildings[building];
         if (!(WeaponKey in def)) {
            revertElementUpgrade(symbol, "xp", save.current);
         }
      }
   });

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
