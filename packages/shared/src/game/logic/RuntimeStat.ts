import { forEach, safeAdd } from "../../utils/Helper";
import { RingBuffer } from "../../utils/RingBuffer";
import { DamageType } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import type { Resource } from "../definitions/Resource";
import type { GameState } from "../GameState";

export class RuntimeStat {
   rawDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);
   actualDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);
   previousResources: RingBuffer<Map<Resource, number>> = new RingBuffer(100);

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

   public averageResourceDelta(res: Resource, n: number): number {
      const prev = this.previousResources.get(-(n + 1)) ?? this.previousResources.get(0);
      const curr = this.previousResources.get(-1) ?? this.previousResources.get(0);
      if (!prev || !curr || n <= 0) {
         return 0;
      }
      return ((curr.get(res) ?? 0) - (prev.get(res) ?? 0)) / Math.min(n, this.previousResources.size);
   }

   public tabulate([hp, maxHp]: [number, number], gs: GameState): void {
      forEach(this.rawDamagePerSec, (k, v) => {
         safeAdd(this.rawDamage, k, v);
      });
      forEach(this.actualDamagePerSec, (k, v) => {
         safeAdd(this.actualDamage, k, v);
      });

      this.previousResources.push(new Map(gs.resources));

      this.rawDamages.push(this.rawDamagePerSec);
      this.actualDamages.push(this.actualDamagePerSec);
      this.rawDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };
      this.actualDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };

      this.currentHp = hp;
      this.maxHp = maxHp + this.destroyedHp;
   }
}
