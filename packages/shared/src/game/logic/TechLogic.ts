import { camelToHuman, entriesOf, forEach } from "../../utils/Helper";
import { Config } from "../Config";
import { Blueprints } from "../definitions/Blueprints";
import type { Building } from "../definitions/Buildings";
import { ShipClass, ShipClassList } from "../definitions/ShipClass";
import type { Tech } from "../definitions/TechDefinitions";
import type { GameState } from "../GameState";
import { getBuildingName } from "./BuildingLogic";

export function checkTechPrerequisites(tech: Tech, gs: GameState): boolean {
   const def = Config.Tech[tech];
   for (const req of def.requires) {
      if (!gs.unlockedTech.has(req)) {
         return false;
      }
   }
   return true;
}

export function isTechUnderDevelopment(tech: Tech): boolean {
   const def = Config.Tech[tech];
   return def.position.x > 0 && def.requires.length <= 0;
}

export function getShipClass(gs: GameState): ShipClass {
   let x = 0;
   gs.unlockedTech.forEach((t) => {
      x = Math.max(x, Config.Tech[t].position.x);
   });
   return techColumnToShipClass(x);
}

export function hasUnlockedShipClass(shipClass: ShipClass, gs: GameState): boolean {
   const currentShipClass = getShipClass(gs);
   return ShipClassList.indexOf(shipClass) <= ShipClassList.indexOf(currentShipClass);
}

export function getPreviousShipClass(shipClass: ShipClass): ShipClass | undefined {
   const idx = ShipClassList.indexOf(shipClass) - 1;
   if (idx >= 0 && idx < ShipClassList.length) {
      return ShipClassList[idx];
   }
   return undefined;
}

export function getNextShipClass(shipClass: ShipClass): ShipClass | undefined {
   const idx = ShipClassList.indexOf(shipClass) + 1;
   if (idx >= 0 || idx < ShipClassList.length) {
      return ShipClassList[idx];
   }
   return undefined;
}

export function techColumnToShipClass(column: number): ShipClass {
   let shipClass: ShipClass = "Skiff";
   forEach(ShipClass, (k, v) => {
      if (v.range[0] <= column && v.range[1] >= column) {
         shipClass = k;
         // break;
         return true;
      }
   });
   return shipClass;
}

export function getTechShipClass(tech: Tech): ShipClass {
   return techColumnToShipClass(Config.Tech[tech].position.x);
}

export function getTechInShipClass(shipClass: ShipClass): Tech[] {
   const result: Tech[] = [];
   const [minX, maxX] = ShipClass[shipClass].range;
   forEach(Config.Tech, (tech, def) => {
      if (def.position.x >= minX && def.position.x <= maxX) {
         result.push(tech);
      }
   });
   return result;
}

export function getTechWithinShipClass(shipClass: ShipClass): Tech[] {
   const result: Tech[] = [];
   const [_, maxX] = ShipClass[shipClass].range;
   forEach(Config.Tech, (tech, def) => {
      if (def.position.x <= maxX) {
         result.push(tech);
      }
   });
   return result;
}

export function getMaxQuantumForShipClass(shipClass: ShipClass, gs: GameState): number {
   return getTechInShipClass(shipClass).length + Blueprints[gs.blueprint].blueprint[shipClass].length;
}

/**
 * Get all buildings **in or below** the given ship class
 */
export function getBuildingsWithinShipClass(shipClass: ShipClass): Building[] {
   const result: Building[] = [];
   const maxX = ShipClass[shipClass].range[1];
   forEach(Config.Tech, (_, def) => {
      if (def.position.x <= maxX) {
         def.unlockBuildings?.forEach((b) => {
            result.push(b);
         });
      }
   });
   return result;
}

/**
 * Get all buildings **in** the given ship class
 */
export function getBuildingsInShipClass(shipClass: ShipClass): Building[] {
   const result: Building[] = [];
   const [minX, maxX] = ShipClass[shipClass].range;
   forEach(Config.Tech, (_, def) => {
      if (def.position.x >= minX && def.position.x <= maxX) {
         def.unlockBuildings?.forEach((b) => {
            result.push(b);
         });
      }
   });
   return result;
}

export function getTechName(tech: Tech): string {
   const def = Config.Tech[tech];
   return def.name?.() ?? camelToHuman(tech);
}

export function getTechDesc(tech: Tech): string {
   const def = Config.Tech[tech];
   const desc: string[] = [];
   def.unlockBuildings?.forEach((b) => {
      desc.push(getBuildingName(b));
   });
   def.unlockUpgrades?.forEach((u) => {
      desc.push(u.name());
   });
   return desc.join(", ");
}

export function getTechForBuilding(building: Building): Tech | undefined {
   for (const [tech, def] of entriesOf(Config.Tech)) {
      if (def.unlockBuildings?.includes(building) && !isPlaceholderTech(tech)) {
         return tech;
      }
   }
   console.warn(`No tech unlocks building ${building}`);
   return undefined;
}

export function isPlaceholderTech(tech: Tech): boolean {
   const def = Config.Tech[tech];
   if (def.position.x === 0) {
      return false;
   }
   return def.requires.length === 0;
}
