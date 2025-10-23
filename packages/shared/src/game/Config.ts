import { forEach, formatNumber, keysOf, sizeOf, tileToString } from "../utils/Helper";
import { L, t } from "../utils/i18n";
import { Blueprints } from "./definitions/Blueprints";
import { type Building, Buildings } from "./definitions/Buildings";
import { MaxBattleTick } from "./definitions/Constant";
import { Resources } from "./definitions/Resource";
import { type ShipClass } from "./definitions/ShipClass";
import { type StatusEffect, StatusEffects } from "./definitions/StatusEffect";
import { type Tech, TechDefinitions } from "./definitions/TechDefinitions";
import { techColumnToShipClass } from "./logic/TechLogic";
import { type ElementSymbol, PeriodicTable } from "./PeriodicTable";

console.assert(sizeOf(Buildings) < MaxBattleTick);
const BuildingId = Object.fromEntries(Object.entries(Buildings).map(([b, _], i) => [b, i])) as Record<Building, number>;

export const Config = {
   Buildings,
   BuildingId,
   Resources,
   Tech: new TechDefinitions(),
   Elements: new Map<ElementSymbol, Building | ((value: number) => string)>([
      ["H", (val) => t(L.HourSOfTimeWarpStorage, formatNumber(val))],
   ]),
   BuildingToTech: {} as Record<Building, Tech>,
   BuildingToShipClass: {} as Record<Building, ShipClass>,
};

function initConfig(): void {
   forEach(Config.Tech, (tech, def) => {
      const shipClass = techColumnToShipClass(def.position.x);
      def.unlockBuildings?.forEach((building) => {
         Config.BuildingToTech[building] = tech;
         Config.BuildingToShipClass[building] = shipClass;
      });
   });

   const statusEffects = new Set<StatusEffect>(keysOf(StatusEffects));
   forEach(Config.BuildingToTech, (building, tech) => {
      const def = Config.Buildings[building];
      if ("ability" in def && def.ability) {
         statusEffects.delete(def.ability.effect);
      }
      if (def.element) {
         if (Config.Elements.get(def.element)) {
            console.error(
               `Element ${def.element} are used by multiple buildings: ${Config.Elements.get(def.element)} and ${building}`,
            );
         }
         Config.Elements.set(def.element, building);
      }
   });

   forEach(Blueprints, (key, def) => {
      let previousLayout: number[] | undefined;
      forEach(def.blueprint, (shipClass, layout) => {
         if (layout.length === 0) {
            return;
         }
         if (!previousLayout) {
            previousLayout = layout;
            return;
         }
         previousLayout.forEach((tile, i) => {
            if (!layout.includes(tile)) {
               console.error(`Design ${key}: tile ${tile} (${tileToString(tile)}) required in ${shipClass} class`);
            }
         });
         previousLayout = layout;
      });
   });

   if (typeof window !== "undefined") {
      console.log("Unused Status Effects", statusEffects);
      console.log(
         "Unused Buildings",
         keysOf(Buildings).filter((b) => !Config.BuildingToTech[b]),
      );
      console.log(
         "Unused Elements",
         keysOf(PeriodicTable).filter((e) => !Config.Elements.has(e)),
      );
   }
}

initConfig();
