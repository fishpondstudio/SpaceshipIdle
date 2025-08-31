import { cast, formatNumber, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { Runtime } from "../logic/Runtime";
import type { ShipClass } from "./ShipClass";

export interface IAddonDefinition {
   name: () => string;
   desc: (value: number) => string;
   tick: (value: number, tile: Tile, runtime: Runtime) => void;
   shipClass: ShipClass;
}

export const Addons = {
   HP1: cast<IAddonDefinition>({
      name: () => t(L.HPCluster),
      desc: (value: number) => t(L.HPCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Skiff",
   }),
   Evasion1: cast<IAddonDefinition>({
      name: () => t(L.EvasionCluster),
      desc: (value: number) => t(L.EvasionCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Skiff",
   }),
   Damage1: cast<IAddonDefinition>({
      name: () => t(L.DamageCluster),
      desc: (value: number) => t(L.DamageCoreDesc, formatNumber(value), formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Scout",
   }),
   Damage2: cast<IAddonDefinition>({
      name: () => t(L.DamageDiversifier),
      desc: (value: number) => t(L.DamageDiversifierDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Scout",
   }),
   HP2: cast<IAddonDefinition>({
      name: () => t(L.HPEqualizer),
      desc: (value: number) => t(L.HPEqualizerDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         throw new Error("Not implemented");
      },
      shipClass: "Scout",
   }),
} as const satisfies Record<string, IAddonDefinition>;

export type Addon = keyof typeof Addons;

export function getAddonEffect(amount: number): number {
   if (amount <= 0) {
      return 0;
   }
   let result = 0;
   for (let i = 1; i <= amount; i++) {
      result += 1 / i;
   }
   return result;
}
