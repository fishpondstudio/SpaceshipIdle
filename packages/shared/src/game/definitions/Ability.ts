import { clamp, createTile, hasFlag, type Tile, tileToPoint, type ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getDamagePerFire } from "../logic/BuildingLogic";
import type { Multipliers } from "../logic/IMultiplier";
import { Side } from "../logic/Side";
import type { Building } from "./Buildings";
import { LaserArrayDamagePct } from "./Constant";
import { ProjectileFlag } from "./ProjectileFlag";
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
   FrontAndRear: 6,
   Flanks: 7,
   Range1: 8,
   Range2: 9,
   Range3: 10,
   Row: 11,
   Column: 12,
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
   [AbilityRange.FrontAndRear]: () => t(L.AbilityRangeFrontAndRear),
   [AbilityRange.Flanks]: () => t(L.AbilityRangeFlanks),
   [AbilityRange.Range1]: () => t(L.AbilityRangeRange1),
   [AbilityRange.Range2]: () => t(L.AbilityRangeRange2),
   [AbilityRange.Range3]: () => t(L.AbilityRangeRange3),
   [AbilityRange.Row]: () => t(L.AbilityRangeRow),
   [AbilityRange.Column]: () => t(L.AbilityRangeColumn),
};

export const AbilityRangeTexture: Partial<Record<AbilityRange, string>> = {
   [AbilityRange.Adjacent]: "Others/Adjacent",
   [AbilityRange.Front]: "Others/Front",
   [AbilityRange.FrontTrio]: "Others/FrontTrio",
   [AbilityRange.Rear]: "Others/Rear",
   [AbilityRange.RearTrio]: "Others/RearTrio",
   [AbilityRange.FrontAndRear]: "Others/FrontAndRear",
   [AbilityRange.Flanks]: "Others/Flanks",
   [AbilityRange.Range1]: "Others/Range1",
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
      case AbilityRange.FrontAndRear: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x + forward, y))) {
            result.push(createTile(x + forward, y));
         }
         if (tiles.has(createTile(x - forward, y))) {
            result.push(createTile(x - forward, y));
         }
         break;
      }
      case AbilityRange.Flanks: {
         const { x, y } = tileToPoint(tile);
         result.push(tile);
         if (tiles.has(createTile(x, y + 1))) {
            result.push(createTile(x, y + 1));
         }
         if (tiles.has(createTile(x, y - 1))) {
            result.push(createTile(x, y - 1));
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

function abilityTargetCount(range: AbilityRange): number {
   switch (range) {
      case AbilityRange.Single:
         return 1;
      case AbilityRange.Adjacent:
         return 1 + 4;
      case AbilityRange.Rear:
      case AbilityRange.Front:
         return 1 + 1;
      case AbilityRange.RearTrio:
      case AbilityRange.FrontTrio:
         return 1 + 3;
      case AbilityRange.Range1:
         return 1 + 8;
      case AbilityRange.Range2:
         return 1 + 24;
      case AbilityRange.Range3:
         return 1 + 48;
      case AbilityRange.Row:
         return 1 + 10;
      case AbilityRange.Column:
         return 1 + 10;
      default:
         throw new Error(`Unknown ability range: ${range}`);
   }
}

export function abilityDurationFactor(duration: number): number {
   if (duration <= 1) {
      return 1;
   }
   return (1 * (1 + duration / 10)) / duration;
}

export function abilityRangeFactor(range: AbilityRange): number {
   const count = abilityTargetCount(range);
   return 1 / Math.sqrt(count);
}

export function abilityDamage(building: Building, level: number, multipliers: Required<Multipliers>): number {
   const def = Config.Buildings[building];
   if (!def.ability) {
      return 0;
   }
   let damage = getDamagePerFire({ type: building, level }) * multipliers.damage;

   if (hasFlag(def.projectileFlag, ProjectileFlag.LaserDamage)) {
      damage = damage * (LaserArrayDamagePct - def.damagePct);
   } else {
      damage = damage * (1 - def.damagePct);
   }

   if (def.projectiles > 1) {
      console.error("Weapons with multiple projectiles are not supported!");
   }
   const duration = def.ability.duration(building, level, multipliers);
   damage = damage * abilityDurationFactor(duration) * abilityRangeFactor(def.ability.range);
   return damage;
}

export function criticalDamagePct(chance: number, multiplier: number): number {
   return 1 / (chance * multiplier + (1 - chance));
}

export const AbilityStatDamagePct = 0.8;

export function abilityStat(building: Building, level: number): number {
   const def = Config.Buildings[building];
   if (!def.ability) {
      return 0;
   }

   let result = level * 0.5;

   if (hasFlag(def.projectileFlag, ProjectileFlag.LaserDamage)) {
      console.assert(
         def.damagePct === AbilityStatDamagePct * LaserArrayDamagePct,
         `Building ${building}: expected damage pct to be ${AbilityStatDamagePct * LaserArrayDamagePct} but got ${def.damagePct}`,
      );
      // Laser stat ability is not as effective as damage - so we give a discount
      result = result * Math.sqrt(LaserArrayDamagePct);
   } else {
      console.assert(
         def.damagePct === AbilityStatDamagePct,
         `Building ${building}: expected damage pct to be ${AbilityStatDamagePct} but got ${def.damagePct}`,
      );
   }

   if (def.projectiles > 1) {
      console.error("Weapons with multiple projectiles are not supported!");
   }
   result = result * abilityRangeFactor(def.ability.range);
   return result;
}

export function abilityChance(_: Building, level: number): number {
   return clamp(0.05 + (level - 1) * 0.005, 0, 0.5);
}
