import { forEach, keysOf, sizeOf, tileToPoint } from "../utils/Helper";
import { type Building, Buildings } from "./definitions/Buildings";
import { MaxBattleTick } from "./definitions/Constant";
import { Resources } from "./definitions/Resource";
import { ShipDesigns } from "./definitions/ShipDesign";
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
   Elements: {} as Record<ElementSymbol, Building>,
   BuildingToTech: {} as Record<Building, Tech>,
   BuildingToShipClass: {} as Record<Building, ShipClass>,
};

function initConfig(): void {
   const statusEffects = new Set<StatusEffect>(keysOf(StatusEffects));
   forEach(Config.Buildings, (building, def) => {
      if ("ability" in def && def.ability) {
         statusEffects.delete(def.ability.effect);
      }
      if (def.element) {
         Config.Elements[def.element] = building;
      }
   });

   forEach(Config.Tech, (tech, def) => {
      const shipClass = techColumnToShipClass(def.position.x);
      def.unlockBuildings?.forEach((building) => {
         Config.BuildingToTech[building] = tech;
         Config.BuildingToShipClass[building] = shipClass;
      });
   });

   forEach(ShipDesigns, (key, design) => {
      let previousLayout: number[] | undefined;
      forEach(design, (shipClass, layout) => {
         if (!previousLayout) {
            previousLayout = layout;
            return;
         }
         previousLayout.forEach((tile, i) => {
            if (!layout.includes(tile)) {
               console.error(`Design ${key}: tile ${tileToPoint(tile)} required in ${shipClass} class`);
            }
         });
         previousLayout = layout;
      });
   });

   if (typeof window !== "undefined") {
      console.log("Unused Status Effects", statusEffects);
   }
}

initConfig();
