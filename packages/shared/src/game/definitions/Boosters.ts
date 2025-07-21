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
      name: () => t(L.HPCore),
      desc: (value: number) => t(L.HPCoreDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         const rs = runtime.get(tile);
         if (rs) {
            rs.props.hp *= 1 + value;
         }
      },
      shipClass: "Skiff",
   },
   Damage1: {
      name: () => t(L.DamageCore),
      desc: (value: number) => t(L.DamageCoreDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         const rs = runtime.get(tile);
         if (rs) {
            rs.props.damagePerProjectile *= 1 + value;
         }
      },
      shipClass: "Skiff",
   },
   Evasion1: {
      name: () => t(L.EvasionCore),
      desc: (value: number) => t(L.EvasionCoreDesc, formatNumber(value)),
      tick: (value: number, tile: Tile, runtime: Runtime) => {
         const rs = runtime.get(tile);
         if (rs) {
            rs.props.evasion += value;
         }
      },
      shipClass: "Skiff",
   },
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
