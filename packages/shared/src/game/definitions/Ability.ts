import { createTile, type Tile, tileToPoint, type ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Multipliers } from "../logic/IMultiplier";
import { Side } from "../logic/Side";
import type { Building } from "./Buildings";
import type { StatusEffect } from "./StatusEffect";

export const AbilityTiming = {
   OnFire: 0,
   OnHit: 1,
} as const;

export const AbilityTimingLabel: Record<AbilityTiming, () => string> = {
   [AbilityTiming.OnFire]: () => t(L.AbilityTimingOnFire),
   [AbilityTiming.OnHit]: () => t(L.AbilityTimingOnHit),
};

export const AbilityTargetLabel: Record<AbilityTiming, () => string> = {
   [AbilityTiming.OnFire]: () => t(L.AbilityTargetOnFire),
   [AbilityTiming.OnHit]: () => t(L.AbilityTargetOnHit),
};

export type AbilityTiming = ValueOf<typeof AbilityTiming>;

export const AbilityRange = {
   Single: 0,
   Adjacent: 1,
   Front: 2,
   FrontTrio: 3,
   Rear: 4,
   RearTrio: 5,
   Range1: 6,
   Range2: 7,
   Range3: 8,
   Row: 9,
   Column: 10,
} as const;

export type AbilityRange = ValueOf<typeof AbilityRange>;

export const AbilityFlag = {
   None: 0,
   AffectedByDamageMultiplier: 1 << 0,
   AffectedByHPMultiplier: 1 << 1,
};

export type AbilityFlag = ValueOf<typeof AbilityFlag>;

export const AbilityRangeLabel: Record<AbilityRange, () => string> = {
   [AbilityRange.Single]: () => t(L.AbilityRangeSingle),
   [AbilityRange.Adjacent]: () => t(L.AbilityRangeAdjacent),
   [AbilityRange.Front]: () => t(L.AbilityRangeFront),
   [AbilityRange.FrontTrio]: () => t(L.AbilityRangeFrontTrio),
   [AbilityRange.Rear]: () => t(L.AbilityRangeRear),
   [AbilityRange.RearTrio]: () => t(L.AbilityRangeRearTrio),
   [AbilityRange.Range1]: () => t(L.AbilityRangeRange1),
   [AbilityRange.Range2]: () => t(L.AbilityRangeRange2),
   [AbilityRange.Range3]: () => t(L.AbilityRangeRange3),
   [AbilityRange.Row]: () => t(L.AbilityRangeRow),
   [AbilityRange.Column]: () => t(L.AbilityRangeColumn),
};

export interface Ability {
   timing: AbilityTiming;
   range: AbilityRange;
   effect: StatusEffect;
   flag: AbilityFlag;
   value: (self: Building, level: number, multipliers: Required<Multipliers>) => number;
   duration: (self: Building, level: number, multipliers: Required<Multipliers>) => number;
}

export function abilityTarget<T>(
   side: Side,
   range: AbilityRange,
   tile: Tile,
   tiles: Map<Tile, T>,
   result?: Tile[],
): Tile[] {
   result ??= [];
   const forward = side === Side.Left ? 1 : -1;
   switch (range) {
      case AbilityRange.Single: {
         result.push(tile);
         break;
      }
      case AbilityRange.Rear: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x - forward, y))) {
            result.push(createTile(x - forward, y));
         }
         break;
      }
      case AbilityRange.RearTrio: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x - forward, y))) {
            result.push(createTile(x - forward, y));
         }
         if (tiles.has(createTile(x - forward, y + 1))) {
            result.push(createTile(x - forward, y + 1));
         }
         if (tiles.has(createTile(x - forward, y - 1))) {
            result.push(createTile(x - forward, y - 1));
         }
         break;
      }
      case AbilityRange.Front: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x + forward, y))) {
            result.push(createTile(x + forward, y));
         }
         break;
      }
      case AbilityRange.FrontTrio: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x + forward, y))) {
            result.push(createTile(x + forward, y));
         }
         if (tiles.has(createTile(x + forward, y + 1))) {
            result.push(createTile(x + forward, y + 1));
         }
         if (tiles.has(createTile(x + forward, y - 1))) {
            result.push(createTile(x + forward, y - 1));
         }
         break;
      }
      case AbilityRange.Adjacent: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x + 1, y))) {
            result.push(createTile(x + 1, y));
         }
         if (tiles.has(createTile(x - 1, y))) {
            result.push(createTile(x - 1, y));
         }
         if (tiles.has(createTile(x, y + 1))) {
            result.push(createTile(x, y + 1));
         }
         if (tiles.has(createTile(x, y - 1))) {
            result.push(createTile(x, y - 1));
         }
         break;
      }
      case AbilityRange.Range1: {
         const { x, y } = tileToPoint(tile);
         for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
               const target = createTile(x + dx, y + dy);
               if (tiles.has(target)) {
                  result.push(target);
               }
            }
         }
         break;
      }
      case AbilityRange.Range2: {
         const { x, y } = tileToPoint(tile);
         for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
               const target = createTile(x + dx, y + dy);
               if (tiles.has(target)) {
                  result.push(target);
               }
            }
         }
         break;
      }
      case AbilityRange.Range3: {
         const { x, y } = tileToPoint(tile);
         for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
               const target = createTile(x + dx, y + dy);
               if (tiles.has(target)) {
                  result.push(target);
               }
            }
         }
         break;
      }
      case AbilityRange.Row: {
         const { x } = tileToPoint(tile);
         tiles.forEach((_, target) => {
            const { x: currentX } = tileToPoint(target);
            if (currentX === x) {
               result.push(target);
            }
         });
         break;
      }
      case AbilityRange.Column: {
         const { y } = tileToPoint(tile);
         tiles.forEach((_, target) => {
            const { y: currentY } = tileToPoint(target);
            if (currentY === y) {
               result.push(target);
            }
         });
         break;
      }
   }
   return result;
}
