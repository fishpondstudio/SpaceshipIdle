import { Config } from "../Config";
import { Addons } from "../definitions/Addons";
import { Augments } from "../definitions/Augments";
import { Blueprints } from "../definitions/Blueprints";
import type { Building } from "../definitions/Buildings";
import { Catalyst } from "../definitions/Catalyst";
import { Directives } from "../definitions/Directives";
import type { GameState } from "../GameState";
import { getShipBlueprint, isShipConnected } from "./ShipLogic";

export function validateShip(gs: GameState): boolean {
   if (!Blueprints[gs.blueprint]) {
      return false;
   }

   const buildings = new Set<Building>();
   const blueprint = new Set(getShipBlueprint(gs));

   for (const [tile, _] of gs.tiles) {
      if (!blueprint.has(tile)) {
         return false;
      }
   }

   if (!isShipConnected(gs.tiles.keys())) {
      return false;
   }

   for (const tech of gs.unlockedTech) {
      const def = Config.Tech[tech];
      if (!def) {
         return false;
      }
      def.unlockBuildings?.forEach((b) => {
         buildings.add(b);
      });
      for (const r of def.requires) {
         if (!gs.unlockedTech.has(r)) {
            return false;
         }
      }
   }

   for (const [_tile, data] of gs.tiles) {
      if (!buildings.has(data.type)) {
         return false;
      }
   }

   for (const tech of gs.unlockedTech) {
      if (!Config.Tech[tech]) {
         return false;
      }
   }

   for (const [element] of gs.elements) {
      if (!Config.Elements.has(element)) {
         return false;
      }
   }

   for (const [element] of gs.permanentElements) {
      if (!Config.Elements.has(element)) {
         return false;
      }
   }

   for (const [_, catalyst] of gs.selectedCatalysts) {
      if (!Catalyst[catalyst]) {
         return false;
      }
   }

   for (const [shipClass, bonus] of gs.selectedDirectives) {
      if (!Directives[shipClass].includes(bonus)) {
         return false;
      }
   }

   for (const [augment, _] of gs.augments) {
      if (!Augments[augment]) {
         return false;
      }
   }

   for (const [addon, _] of gs.addons) {
      if (!Addons[addon]) {
         return false;
      }
   }

   return true;
}
