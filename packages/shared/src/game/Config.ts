import { forEach, keysOf, reduceOf, sizeOf } from "../utils/Helper";
import type { IBuildingDefinition } from "./definitions/BuildingProps";
import { Buildings, type Building } from "./definitions/Buildings";
import type { Resource } from "./definitions/Resource";
import { Resources } from "./definitions/Resource";
import { TechDefinitions } from "./definitions/TechDefinitions";
import { getTechForBuilding } from "./logic/TechLogic";
import type { ElementSymbol } from "./PeriodicTable";

export const Config = {
   Buildings,
   Resources,
   Tech: new TechDefinitions(),
   Element: new Map<ElementSymbol, Building>(),
   Price: new Map<Resource, number>([
      ["Power", 0],
      ["Warp", 0],
      ["XP", 1],
   ]),
   NormalizedPrice: new Map<Resource, number>([
      ["Power", 0],
      ["Warp", 0],
      ["XP", 1],
   ]),
   ResourceTier: new Map<Resource, number>([["Power", 1]]),
} as const;

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

function calculatePrice(res: Resource): [number, number] {
   if (Config.Price.has(res)) {
      return [Config.Price.get(res)!, Config.NormalizedPrice.get(res)!];
   }
   const [building, def] = getBuildingThatProduces(res);
   const input = new Set(keysOf(def.input));
   input.delete("Power");
   if (input.size === 0) {
      const price = 2 ** (Config.Tech[getTechForBuilding(building)].ring - 1);
      Config.Price.set(res, price);
      Config.NormalizedPrice.set(res, price);
      Config.ResourceTier.set(res, 1);
      return [price, price];
   }

   let inputPrice = 0;
   let inputNormalizedPrice = 0;
   let inputTier = 0;

   forEach(def.input, (res, amount) => {
      const [price, normalizedPrice] = calculatePrice(res);
      inputPrice += price * amount;
      inputNormalizedPrice += normalizedPrice * amount;
      inputTier = Math.max(inputTier, Config.ResourceTier.get(res) ?? 0);
   });

   const multiplier = priceMultiplier(sizeOf(def.input));
   const outputAmount = reduceOf(def.output, (acc, k, v) => acc + v, 0);
   if (inputPrice === 0) {
      throw new Error(`Resource ${res} has 0 price`);
   }
   const normalizedPrice = inputNormalizedPrice / outputAmount;
   const price = (inputPrice * multiplier) / outputAmount;
   Config.NormalizedPrice.set(res, normalizedPrice);
   Config.Price.set(res, price);
   Config.ResourceTier.set(res, inputTier + 1);
   return [price, normalizedPrice];
}

export function priceMultiplier(inputSize: number): number {
   return 1.25 + 0.25 * inputSize;
}

forEach(Config.Resources, (res) => {
   calculatePrice(res);
});

forEach(Config.Buildings, (b) => {
   const def = Config.Buildings[b];
   if (def.element) {
      if (Config.Element.has(def.element)) {
         throw new Error(`Element ${def.element} is already defined for building ${b}`);
      }
      Config.Element.set(def.element, b);
   }
});

forEach(Config.Tech, (tech, def) => {
   def.unlockBuildings?.forEach((b) => {
      const building = Config.Buildings[b];
      const buildings = new Set<Building>();
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
      // forEach(def.multiplier, (b, multiplier) => {
      //    if (!buildings.has(b)) {
      //       console.error(`Tech ${tech} should remove multiplier for building ${b}`);
      //    }
      // });
   });
});

console.log("Price", Config.Price);
console.log("Normalized Price", Config.NormalizedPrice);
console.log("Resource Tier", Config.ResourceTier);
console.log(`# of techs: ${sizeOf(Config.Tech)}`);
