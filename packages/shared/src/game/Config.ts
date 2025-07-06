import { forEach, hasFlag, keysOf, reduceOf, sizeOf } from "../utils/Helper";
import { BuildingFlag, WeaponKey, type IBuildingDefinition } from "./definitions/BuildingProps";
import { Buildings, type Building } from "./definitions/Buildings";
import { MaxBattleTick } from "./definitions/Constant";
import type { Resource } from "./definitions/Resource";
import { Resources } from "./definitions/Resource";
import { StatusEffects, type StatusEffect } from "./definitions/StatusEffect";
import { TechDefinitions } from "./definitions/TechDefinitions";
import { getBuildingValue } from "./logic/BuildingLogic";
import { getTechForBuilding } from "./logic/TechLogic";
import { PeriodicTable, type ElementSymbol } from "./PeriodicTable";

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

function getBuildingThatProduces(res: Resource): [Building, IBuildingDefinition] {
   let b: Building;
   for (b in Config.Buildings) {
      const def = Config.Buildings[b];
      if (!("output" in def)) continue;
      if (res in def.output) {
         return [b, def];
      }
   }
   throw new Error(`Resource ${res} cannot be produced by any building`);
}

function calculatePrice(res: Resource): number {
   if (Config.Price.has(res)) {
      return Config.Price.get(res)!;
   }
   const [building, def] = getBuildingThatProduces(res);
   Config.ResourceToBuilding.set(res, building);
   const input = new Set(keysOf(def.input));
   input.delete("Power");
   if (input.size === 0) {
      const price = 2 ** Config.Tech[getTechForBuilding(building)].ring;
      Config.Price.set(res, price);
      Config.ResourceTier.set(res, 1);
      return price;
   }

   let inputPrice = 0;
   let inputTier = 0;

   forEach(def.input, (res, amount) => {
      const price = calculatePrice(res);
      inputPrice += price * amount;
      inputTier = Math.max(inputTier, Config.ResourceTier.get(res) ?? 0);
   });

   const outputAmount = reduceOf(def.output, (acc, k, v) => acc + v, 0);
   if (inputPrice === 0) {
      throw new Error(`Resource ${res} has 0 price`);
   }
   const price = inputPrice / outputAmount;
   Config.Price.set(res, price);
   Config.ResourceTier.set(res, inputTier + 1);
   return price;
}

function initConfig(): void {
   forEach(Config.Resources, (res) => {
      calculatePrice(res);
   });

   forEach(Config.Buildings, (b) => {
      const def = Config.Buildings[b];
      if (def.element) {
         if (Config.Elements.has(def.element)) {
            const unusedElements = new Set(keysOf(PeriodicTable));
            forEach(Config.Buildings, (b, def) => {
               if (def.element) {
                  unusedElements.delete(def.element);
               }
            });
            throw new Error(
               `Element ${def.element} is already defined for building ${b}. Unused elements: ${Array.from(unusedElements).join(", ")}`,
            );
         }
         Config.Elements.set(def.element, b);
      }
   });

   const suppressWarnings = new Set<Building>(["AC76A"]);

   forEach(Config.Tech, (tech, def) => {
      const resources = new Set<Resource>();
      def.requires.forEach((t) => {
         Config.Tech[t].unlockBuildings?.forEach((b) => {
            if (WeaponKey in Config.Buildings[b]) {
               forEach(Config.Buildings[b].output, (res) => {
                  resources.add(res);
               });
            }
         });
      });
      def.unlockBuildings?.forEach((b) => {
         const building = Config.Buildings[b];
         const buildings = new Set<Building>();
         if (sizeOf(building.input) > 0) {
            resources.forEach((res) => {
               if (!suppressWarnings.has(b) && !building.input[res]) {
                  console.error(`Building ${b} should have input ${res}`);
               }
            });
         }
         forEach(building.input, (res, amount) => {
            if (res === "Power") return;
            const [building, _] = getBuildingThatProduces(res);
            buildings.add(building);
         });
         buildings.forEach((b) => {
            if (!def.multiplier?.[b]) {
               console.error(`Tech ${tech} should add multiplier for building ${b}`);
            }
         });
         Config.BuildingTier.set(b, def.ring);
         // forEach(def.multiplier, (b, multiplier) => {
         //    if (!buildings.has(b)) {
         //       console.error(`Tech ${tech} should remove multiplier for building ${b}`);
         //    }
         // });
      });
   });

   forEach(Config.Buildings, (building, def) => {
      const cost = getBuildingValue(building, 1);
      if (!hasFlag(def.buildingFlag, BuildingFlag.Booster) && (cost.get("XP") ?? 0) <= 0) {
         console.error(`Building ${building} has no value`);
      }
   });

   const statusEffects = new Set<StatusEffect>(keysOf(StatusEffects));
   forEach(Config.Buildings, (building, def) => {
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
