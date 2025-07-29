import { formatNumber, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { Runtime } from "../logic/Runtime";
import type { ShipClass } from "./TechDefinitions";

export interface IBoosterDefinition {
   name: () => string;
   desc: (value: number) => string;
   tick: (value: number, tile: Tile, runtime: Runtime) => void;
   shipClass: ShipClass;
}

export const Boosters = {
   HP1: {
      name: () => t(L.HPCluster),
      desc: (value: number) => t(L.HPCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Skiff",
   } as IBoosterDefinition,
   Evasion1: {
      name: () => t(L.EvasionCluster),
      desc: (value: number) => t(L.EvasionCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Skiff",
   } as IBoosterDefinition,
   Damage1: {
      name: () => t(L.DamageCluster),
      desc: (value: number) => t(L.DamageCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Scout",
   } as IBoosterDefinition,
   Damage2: {
      name: () => t(L.DamageDiversifier),
      desc: (value: number) => t(L.DamageDiversifierDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Scout",
   } as IBoosterDefinition,
   HP2: {
      name: () => t(L.HPEqualizer),
      desc: (value: number) => t(L.HPEqualizerDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Scout",
   } as IBoosterDefinition,
} as const satisfies Record<string, IBoosterDefinition>;

export type Booster = keyof typeof Boosters;

export function getBoosterEffect(amount: number): number {
   if (amount <= 0) {
      return 0;
   }
   let result = 0;
   for (let i = 1; i <= amount; i++) {
      result += 1 / i;
   }
   return result;
}
