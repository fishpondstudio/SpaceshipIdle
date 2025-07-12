import { forEach, keysOf, sizeOf } from "../utils/Helper";
import { type Building, Buildings } from "./definitions/Buildings";
import { MaxBattleTick } from "./definitions/Constant";
import type { Resource } from "./definitions/Resource";
import { Resources } from "./definitions/Resource";
import { type StatusEffect, StatusEffects } from "./definitions/StatusEffect";
import { TechDefinitions } from "./definitions/TechDefinitions";
import type { ElementSymbol } from "./PeriodicTable";

console.assert(sizeOf(Buildings) < MaxBattleTick);
const BuildingId = Object.fromEntries(Object.entries(Buildings).map(([b, _], i) => [b, i])) as Record<Building, number>;

export const Config = {
   Buildings,
   BuildingId,
   Resources,
   Tech: new TechDefinitions(),
   Elements: new Map<ElementSymbol, Building>(),
   Price: new Map<Resource, number>([
      ["Power", 0],
      ["Warp", 0],
      ["XP", 1],
   ]),
   ResourceTier: new Map<Resource, number>([["Power", 1]]),
   BuildingTier: new Map<Building, number>(),
   ResourceToBuilding: new Map<Resource, Building>(),
};

function initConfig(): void {
   const statusEffects = new Set<StatusEffect>(keysOf(StatusEffects));
   forEach(Config.Buildings, (_building, def) => {
      if ("ability" in def && def.ability) {
         statusEffects.delete(def.ability.effect);
      }
      if ("effect" in def && def.effect) {
         statusEffects.delete(def.effect);
      }
   });

   if (typeof window !== "undefined") {
      console.log("Price", Config.Price);
      console.log("Resource Tier", Config.ResourceTier);
      console.log("Building Tier", Config.BuildingTier);
      console.log("Resource -> Building", Config.ResourceToBuilding);
      console.log("Unused Status Effects", statusEffects);
   }
}

initConfig();
