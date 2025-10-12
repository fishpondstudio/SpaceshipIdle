import { Config } from "../Config";
import { Addons } from "../definitions/Addons";
import { Augments } from "../definitions/Augments";
import { Catalyst } from "../definitions/Catalyst";
import { Directives } from "../definitions/Directives";
import type { GameState } from "../GameState";

export function migrateShipForServer(gs: GameState): boolean {
   let migrated = false;

   if (!gs.augments) {
      gs.augments = new Map();
      migrated = true;
   }

   for (const tech of gs.unlockedTech) {
      if (!Config.Tech[tech]) {
         gs.unlockedTech.delete(tech);
         migrated = true;
      }
   }

   for (const [element] of gs.elements) {
      if (!Config.Elements.has(element)) {
         gs.elements.delete(element);
         migrated = true;
      }
   }

   for (const [element] of gs.permanentElements) {
      if (!Config.Elements.has(element)) {
         gs.permanentElements.delete(element);
         migrated = true;
      }
   }

   for (const [cat, catalyst] of gs.selectedCatalysts) {
      if (!Catalyst[catalyst]) {
         gs.selectedCatalysts.delete(cat);
         migrated = true;
      }
   }

   for (const [shipClass, bonus] of gs.selectedDirectives) {
      if (!Directives[shipClass].includes(bonus)) {
         gs.selectedDirectives.delete(shipClass);
         migrated = true;
      }
   }

   for (const [augment, _] of gs.augments) {
      if (!Augments[augment]) {
         gs.augments.delete(augment);
         migrated = true;
      }
   }

   for (const [addon, _] of gs.addons) {
      if (!Addons[addon]) {
         gs.addons.delete(addon);
         migrated = true;
      }
   }

   return migrated;
}
