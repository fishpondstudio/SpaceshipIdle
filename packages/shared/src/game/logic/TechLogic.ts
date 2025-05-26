import { camelToHuman, entriesOf, forEach } from "../../utils/Helper";
import { Config } from "../Config";
import type { Building } from "../definitions/Buildings";
import type { Resource } from "../definitions/Resource";
import type { Tech } from "../definitions/TechDefinitions";
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
   return def.ring > 0 && def.requires.length <= 0;
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

export function checkTierRequirement(tier: number, gs: GameState): { required: number; unlocked: number } {
   const tech = new Set<Tech>();
   forEach(Config.Tech, (t, def) => {
      if (def.ring === tier - 1) {
         tech.add(t);
      }
   });
   let unlocked = 0;
   for (const t of tech) {
      if (gs.unlockedTech.has(t)) {
         unlocked++;
      }
   }
   return { required: Math.ceil(tech.size / 2), unlocked };
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
