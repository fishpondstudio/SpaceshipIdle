import { camelToHuman, entriesOf, forEach } from "../../utils/Helper";
import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import { ShipClass, type Tech } from "../definitions/TechDefinitions";
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

export function getTechName(tech: Tech): string {
   const def = Config.Tech[tech];
   return def.name?.() ?? camelToHuman(tech);
}

export function getTechDesc(tech: Tech): string {
   const def = Config.Tech[tech];
   const desc: string[] = [];
   def.unlockBuildings?.forEach((b) => desc.push(getBuildingName(b)));
   def.unlockUpgrades?.forEach((u) => desc.push(u.name()));
   return desc.join(", ");
}

export function getTechForBuilding(building: Building): Tech {
   for (const [tech, def] of entriesOf(Config.Tech)) {
      if (def.unlockBuildings?.includes(building)) {
         return tech;
      }
   }
   throw new Error(`No tech unlocks building ${building}`);
}
