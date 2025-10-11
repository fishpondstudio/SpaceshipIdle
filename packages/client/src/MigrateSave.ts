import { Config } from "@spaceship-idle/shared/src/game/Config";
import { Augments } from "@spaceship-idle/shared/src/game/definitions/Augments";
import { Directives } from "@spaceship-idle/shared/src/game/definitions/Directives";
import { FriendshipBonus } from "@spaceship-idle/shared/src/game/definitions/FriendshipBonus";
import { StarSystemFlags } from "@spaceship-idle/shared/src/game/definitions/Galaxy";
import { DefaultShortcuts, GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { GameData, GameState, type SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { getShipClassByIndex } from "@spaceship-idle/shared/src/game/logic/GalaxyLogic";
import { migrateShipForServer } from "@spaceship-idle/shared/src/game/logic/MigrateShip";
import { randOne, sizeOf } from "@spaceship-idle/shared/src/utils/Helper";

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
   save.state = Object.assign(new GameState(), save.state);
   save.options = Object.assign(new GameOption(), save.options);
   save.data = Object.assign(new GameData(), save.data);
   save.options.shortcuts = Object.assign({}, DefaultShortcuts, save.options.shortcuts);

   migrateShipForServer(save.state);

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
   save.data.galaxy.starSystems.forEach((starSystem) => {
      if (!starSystem.flags) {
         starSystem.flags = StarSystemFlags.None;
      }
      const shipClass = getShipClassByIndex(starSystem.distance);
      const candidates = FriendshipBonus[shipClass];
      starSystem.planets.forEach((planet) => {
         if (!candidates.includes(planet.friendshipBonus)) {
            planet.friendshipBonus = randOne(candidates);
         }
      });
   });
   save.state.selectedDirectives.forEach((bonus, shipClass) => {
      if (!Directives[shipClass].includes(bonus)) {
         save.state.selectedDirectives.delete(shipClass);
      }
   });
   console.assert(
      save.data.galaxy.starSystems.length === sizeOf(Augments),
      `Augment Size = ${sizeOf(Augments)}, Galaxy Size = ${save.data.galaxy.starSystems.length}`,
   );
}
