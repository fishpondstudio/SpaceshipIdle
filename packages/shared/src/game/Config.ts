import { forEach, keysOf, sizeOf } from "../utils/Helper";
import { type Building, Buildings } from "./definitions/Buildings";
import { MaxBattleTick } from "./definitions/Constant";
import { Resources } from "./definitions/Resource";
import { type StatusEffect, StatusEffects } from "./definitions/StatusEffect";
import { type ShipClass, type Tech, TechDefinitions } from "./definitions/TechDefinitions";
import { techColumnToShipClass } from "./logic/TechLogic";
import type { ElementSymbol } from "./PeriodicTable";

console.assert(sizeOf(Buildings) < MaxBattleTick);
const BuildingId = Object.fromEntries(Object.entries(Buildings).map(([b, _], i) => [b, i])) as Record<Building, number>;

export const Config = {
   Buildings,
   BuildingId,
   Resources,
   Tech: new TechDefinitions(),
   Elements: new Map<ElementSymbol, Building>(),
   BuildingToTech: {} as Record<Building, Tech>,
   BuildingToShipClass: {} as Record<Building, ShipClass>,
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

   forEach(Config.Tech, (tech, def) => {
      const shipClass = techColumnToShipClass(def.position.x);
      def.unlockBuildings?.forEach((building) => {
         Config.BuildingToTech[building] = tech;
         Config.BuildingToShipClass[building] = shipClass;
      });
   });

   if (typeof window !== "undefined") {
      console.log("Unused Status Effects", statusEffects);
   }
}

initConfig();
