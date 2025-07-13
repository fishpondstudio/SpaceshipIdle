import { camelToHuman, entriesOf, forEach } from "../../utils/Helper";
import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import type { Resource } from "../definitions/Resource";
import { ShipClass, type Tech } from "../definitions/TechDefinitions";
import type { GameState } from "../GameState";

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
   let shipClass: ShipClass = "Skiff";
   forEach(ShipClass, (k, v) => {
      if (v.range[0] <= x && v.range[1] >= x) {
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
   def.unlockBuildings?.forEach((b) => desc.push(Config.Buildings[b].name()));
   def.unlockUpgrades?.forEach((u) => desc.push(u.name()));
   return desc.join(", ");
}

export function getBuildingThatProduce(resource: Resource): Building {
   for (const [b, def] of entriesOf(Config.Buildings)) {
      if ("output" in def && def.output[resource]) {
         return b;
      }
   }
   throw new Error(`No building produces ${resource}`);
}

export function getTechForBuilding(building: Building): Tech {
   for (const [tech, def] of entriesOf(Config.Tech)) {
      if (def.unlockBuildings?.includes(building)) {
         return tech;
      }
   }
   throw new Error(`No tech unlocks building ${building}`);
}

export function getTechForResource(resource: Resource): Tech {
   const building = getBuildingThatProduce(resource);
   return getTechForBuilding(building);
}
