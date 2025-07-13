import { forEach, safeAdd, Tile } from "../../utils/Helper";
import { RingBuffer } from "../../utils/RingBuffer";
import { TypedEvent } from "../../utils/TypedEvent";
import { DamageType } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import type { Runtime } from "./Runtime";

export class RuntimeStat {
   rawDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);
   actualDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);

   currentHp = 0;
   maxHp = 0;
   destroyedHp = 0;
   zeroProjectileSec = 0;

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
   actualDamageByBuilding = new Map<Building, number>();

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

   public tabulate(rt: Runtime): void {
      forEach(this.rawDamagePerSec, (k, v) => {
         safeAdd(this.rawDamage, k, v);
      });
      forEach(this.actualDamagePerSec, (k, v) => {
         safeAdd(this.actualDamage, k, v);
      });
      this.rawDamages.push(this.rawDamagePerSec);
      this.actualDamages.push(this.actualDamagePerSec);
      this.rawDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };
      this.actualDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };

      const [hp, maxHp] = rt.tabulateHp(rt.left.tiles);
      this.currentHp = hp;
      this.maxHp = maxHp + this.destroyedHp;
   }
}
