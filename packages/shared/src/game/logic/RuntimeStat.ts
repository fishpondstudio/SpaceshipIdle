import { forEach, safeAdd, type Tile } from "../../utils/Helper";
import { RingBuffer } from "../../utils/RingBuffer";
import { DamageType } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { Catalyst } from "../definitions/Catalyst";
import { BaseWarmongerChangePerSec } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import type { GameState } from "../GameState";
import { TrackedValue } from "./TrackedValue";

export class RuntimeStat {
   rawDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);
   actualDamages: RingBuffer<Record<DamageType, number>> = new RingBuffer(100);
   // previousResources: RingBuffer<Map<Resource, number>> = new RingBuffer(100);
   catalysts = new Map<Catalyst, { buildings: Set<Building>; tiles: Set<Tile> }>();

   currentHp = 0;
   maxHp = 0;
   destroyedHp = 0;
   zeroProjectileSec = 0;

   warmongerDecrease = new TrackedValue(BaseWarmongerChangePerSec);
   warmongerMin = new TrackedValue(0);
   extraXPPerSecond = new TrackedValue(0);
   victoryPointPerHour = new TrackedValue(0);

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

   // public averageResourceDelta(res: Resource, n: number): number {
   //    const prev = this.previousResources.get(-(n + 1)) ?? this.previousResources.get(0);
   //    const curr = this.previousResources.get(-1) ?? this.previousResources.get(0);
   //    if (!prev || !curr || n <= 0) {
   //       return 0;
   //    }
   //    return ((curr.get(res) ?? 0) - (prev.get(res) ?? 0)) / Math.min(n, this.previousResources.size);
   // }

   public tabulate([hp, maxHp]: [number, number], gs: GameState): void {
      forEach(this.rawDamagePerSec, (k, v) => {
         safeAdd(this.rawDamage, k, v);
      });
      forEach(this.actualDamagePerSec, (k, v) => {
         safeAdd(this.actualDamage, k, v);
      });

      const resources = new Map<Resource, number>();
      for (const [res, data] of gs.resources) {
         resources.set(res, data.total);
      }
      // this.previousResources.push(resources);

      this.rawDamages.push(this.rawDamagePerSec);
      this.actualDamages.push(this.actualDamagePerSec);
      this.rawDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };
      this.actualDamagePerSec = { [DamageType.Kinetic]: 0, [DamageType.Explosive]: 0, [DamageType.Energy]: 0 };

      this.currentHp = hp;
      this.maxHp = maxHp + this.destroyedHp;
   }

   public isCatalystActivated(catalyst: Catalyst): boolean {
      const data = this.catalysts.get(catalyst);
      if (!data) return false;
      return data.buildings.size >= Catalyst[catalyst].amount;
   }

   public prepareForTick(): void {
      for (const key in this) {
         const value = this[key];
         if (value instanceof TrackedValue) {
            value.clear();
         }
      }
   }
}
