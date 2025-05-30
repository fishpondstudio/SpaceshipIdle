import { forEach, safeAdd } from "../../utils/Helper";
import { RingBuffer } from "../../utils/RingBuffer";
import { DamageType } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import type { Resource } from "../definitions/Resource";

export class RuntimeStat {
   produced = new Map<Resource, number>();
   consumed = new Map<Resource, number>();
   delta = new Map<Resource, number>();
   theoreticalProduced = new Map<Resource, number>();
   theoreticalConsumed = new Map<Resource, number>();

   constructed = new Map<Building, number>();
   rawDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);
   actualDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);

   currentHP = 0;
   maxHP = 0;
   destroyedHP = 0;
   undamagedSec = 0;

   rawDamage: Record<DamageType, number> = {
      [DamageType.Kinetic]: 0,
      [DamageType.Explosive]: 0,
      [DamageType.Energy]: 0,
   };
   actualDamage: Record<DamageType, number> = {
      [DamageType.Kinetic]: 0,
      [DamageType.Explosive]: 0,
      [DamageType.Energy]: 0,
   };
   rawDamagePerSec: Record<DamageType, number> = {
      [DamageType.Kinetic]: 0,
      [DamageType.Explosive]: 0,
      [DamageType.Energy]: 0,
   };
   actualDamagePerSec: Record<DamageType, number> = {
      [DamageType.Kinetic]: 0,
      [DamageType.Explosive]: 0,
      [DamageType.Energy]: 0,
   };

   public averageRawDamage(n: number, result: Record<DamageType, number> | null = null): Record<DamageType, number> {
      if (result) {
         forEach(result, (k, v) => {
            result![k] = 0;
         });
      } else {
         result = {
            [DamageType.Kinetic]: 0,
            [DamageType.Explosive]: 0,
            [DamageType.Energy]: 0,
         };
      }

      n = Math.min(n, this.rawDamages.size);
      for (let i = 1; i <= n; i++) {
         const d = this.rawDamages.get(-i);
         if (d) {
            forEach(d, (k, v) => {
               safeAdd(result, k, v);
            });
         }
      }
      forEach(result, (k, v) => {
         result[k] = n === 0 ? 0 : v / n;
      });
      return result;
   }

   public averageActualDamage(n: number, result: Record<DamageType, number> | null = null): Record<DamageType, number> {
      if (result) {
         forEach(result, (k, v) => {
            result![k] = 0;
         });
      } else {
         result = {
            [DamageType.Kinetic]: 0,
            [DamageType.Explosive]: 0,
            [DamageType.Energy]: 0,
         };
      }

      n = Math.min(n, this.actualDamages.size);
      for (let i = 1; i <= n; i++) {
         const d = this.actualDamages.get(-i);
         if (d) {
            forEach(d, (k, v) => {
               safeAdd(result, k, v);
            });
         }
      }
      forEach(result, (k, v) => {
         result[k] = n === 0 ? 0 : v / n;
      });
      return result;
   }
}
