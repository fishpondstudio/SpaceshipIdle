import { forEach, hasFlag, mapSafeAdd, type Tile, tileToPoint } from "../../utils/Helper";
import { TypedEvent } from "../../utils/TypedEvent";
import type { IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import { GameOption } from "../GameOption";
import type { GameState } from "../GameState";
import { GridSize, posToTile } from "../Grid";
import { abilityTarget, AbilityTiming } from "../definitions/Ability";
import { BuildingFlag, ProjectileFlag, WeaponKey } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { BattleTickInterval, DefaultCooldown, MaxBattleTick } from "../definitions/Constant";
import { BattleStatus } from "./BattleStatus";
import { BattleType } from "./BattleType";
import { Projectile } from "./Projectile";
import { Runtime } from "./Runtime";
import type { RuntimeStat } from "./RuntimeStat";
import { RuntimeFlag } from "./RuntimeTile";
import { calculateAABB } from "./ShipLogic";
import { Side } from "./Side";

interface IProjectileHit {
   position: IHaveXY;
   tile: Tile;
   critical: boolean;
}

export const OnProjectileHit = new TypedEvent<IProjectileHit>();
export const OnDamaged = new TypedEvent<{ tile: Tile; amount: number }>();
export const OnEvasion = new TypedEvent<{ tile: Tile }>();

export function tickProjectiles(
   side: Side,
   projectiles: Map<number, Projectile>,
   targets: GameState,
   runtime: Runtime,
): void {
   const aabb = calculateAABB(targets.tiles);
   projectiles.forEach((projectile, id) => {
      const pos = projectile.position();
      const tile = posToTile(pos);
      const point = tileToPoint(tile);
      if ((side === Side.Right && point.x > aabb.max.x) || (side === Side.Left && point.x < aabb.min.x)) {
         projectiles.delete(id);
         return;
      }
      const target = targets.tiles.get(tile);
      if (target && !projectile.hit.has(tile)) {
         if (hasFlag(projectile.flag, ProjectileFlag.LaserDamage)) {
            projectile.hit.add(tile);
         } else {
            projectiles.delete(id);
         }

         const damageTarget = runtime.get(tile);
         if (!damageTarget) return;

         if (hasFlag(damageTarget.props.runtimeFlag, RuntimeFlag.BlockLaser)) {
            projectiles.delete(id);
         }

         const factor = projectile.hit.size > 0 ? 1 / projectile.hit.size : 1;
         const ability = projectile.ability;
         if (ability?.timing === AbilityTiming.OnHit) {
            abilityTarget(side, ability.range, tile, targets.tiles).forEach((target) => {
               const statusEffectTarget = runtime.get(target);
               if (!statusEffectTarget) return;
               statusEffectTarget.addStatusEffect(
                  ability.effect,
                  projectile.fromTile,
                  projectile.building,
                  ability.value(projectile.building, projectile.level) * factor,
                  ability.duration(projectile.building, projectile.level),
               );
            });
         }
         if (runtime.battleType !== BattleType.Simulated) {
            OnProjectileHit.emit({ position: pos, tile: tile, critical: projectile.critical });
         }
         const damage = damageTarget.takeDamage(
            projectile.damage * factor,
            projectile.damageType,
            projectile.flag,
            projectile.building,
         );
         if (damage > 0) {
            const damageSource = runtime.get(projectile.fromTile);
            damageTarget.onTakingDamage(damage, projectile.damageType, damageSource);
            damageSource?.onDealingDamage(damage, projectile.damageType, damageTarget);
         }
         if (damageTarget.isDead) {
            runtime.destroy(tile);
         }
      }
      projectile.time += BattleTickInterval;
   });
}

export function tickTiles(
   side: Side,
   from: GameState,
   to: GameState,
   projectiles: Map<number, Projectile>,
   stat: RuntimeStat,
   rt: Runtime,
): void {
   from.tiles.forEach((data, tile) => {
      const def = Config.Buildings[data.type];
      if (!hasFlag(def.buildingFlag, BuildingFlag.CanTarget)) {
         return;
      }
      if (!(WeaponKey in def)) {
         return;
      }
      const rs = rt.get(tile);
      if (!rs) {
         return null;
      }
      if (rs.insufficient.has("Power")) {
         return;
      }
      if (hasFlag(rs.props.runtimeFlag, RuntimeFlag.NoFire)) {
         return;
      }
      rs.cooldown += BattleTickInterval;
      if (rs.cooldown < rs.props.fireCooldown) {
         return;
      }
      forEach(def.output, (res, _amount) => {
         const amount = _amount * data.level;
         if ((from.resources.get(res) ?? 0) < amount) {
            rs.insufficient.add(res);
         }
      });
      if (rs.insufficient.size > 0) {
         return;
      }
      rs.cooldown = 0;
      const point = tileToPoint(tile);
      let target = rs.target;
      // `target` is no longer valid, will need to re-target
      if (target && !to.tiles.has(target)) {
         rs.target = null;
         target = null;
      }
      if (!target) {
         let distSqr = Number.POSITIVE_INFINITY;
         to.tiles.forEach((_, targetTile) => {
            const targetPoint = tileToPoint(targetTile);
            const dx = targetPoint.x - point.x;
            const dy = targetPoint.y - point.y;
            const newDistSqr = dx * dx + dy * dy;
            if (newDistSqr < distSqr) {
               distSqr = newDistSqr;
               target = targetTile;
            }
         });
      }
      if (target) {
         forEach(def.output, (res, _amount) => {
            const amount = getCooldownMultiplier(data) * _amount * data.level;
            mapSafeAdd(from.resources, res, -amount);
            mapSafeAdd(stat.consumed, res, amount);

            const xp = (Config.Price.get(res) ?? 0) * amount * rs.xpMultiplier.value;
            mapSafeAdd(from.resources, "XP", xp);
            mapSafeAdd(stat.produced, "XP", xp);
         });
         rs.target = target;
         const ability = rs.props.ability;
         if (ability?.timing === AbilityTiming.OnFire) {
            abilityTarget(side, ability.range, tile, from.tiles).forEach((target) => {
               const statusEffectTarget = rt.get(target);
               if (!statusEffectTarget) return;
               statusEffectTarget.addStatusEffect(
                  ability.effect,
                  tile,
                  rs.data.type,
                  ability.value(rs.data.type, rs.data.level),
                  ability.duration(rs.data.type, rs.data.level),
               );
            });
         }
         for (let i = 0; i < def.projectiles; i++) {
            rt.schedule(() => {
               if (!target) return;
               const [damage, critical] = rs.rollDamage();
               projectiles.set(
                  rt.id++,
                  new Projectile(
                     tile,
                     target,
                     damage,
                     data.type,
                     data.level,
                     rs.props.damageType,
                     rs.props.projectileSpeed,
                     rs.props.projectileFlag,
                     critical,
                     rs.props.ability,
                     (rt.random() - 0.5) * GridSize * 0,
                  ),
               );
            }, 0.1 * i);
         }
      }
   });
}

export function getCooldownMultiplier(data: { type: Building }): number {
   const def = Config.Buildings[data.type];
   if ("fireCooldown" in def) {
      return def.fireCooldown / DefaultCooldown;
   }
   return 1;
}

export function damageAfterArmor(value: number): number {
   return 1 - (0.05 * value) / (1 + 0.05 * Math.abs(value));
}

export function damageAfterShield(value: number): number {
   return Math.exp(-0.025 * value);
}

export function damageAfterDeflection(value: number): number {
   return 1 - Math.tanh(0.02 * value);
}

export function evasionChance(value: number): number {
   return 1 - 1 / (1 + value);
}

export function calcShipScore(ship: GameState, reference: GameState): [number, Runtime] {
   const me = structuredClone(ship);
   me.resources.clear();
   const enemy = structuredClone(reference);
   enemy.resources.clear();

   const rt = new Runtime({ current: me, options: new GameOption() }, enemy);
   rt.battleType = BattleType.Simulated;
   const speed = { speed: 1 };
   while (rt.battleStatus === BattleStatus.InProgress && rt.productionTick <= MaxBattleTick) {
      rt.tick(BattleTickInterval, speed);
   }
   if (rt.productionTick >= MaxBattleTick) {
      console.log(`${ship.name} (${ship.id}) vs ${reference.name} (${reference.id}): ${rt.productionTick}s`);
   }
   const [left, right] = rt.totalDealtDamage();
   return [left / right, rt];
}

export function getShipScoreRank(score: number): string {
   if (score >= 1.75) {
      return "S";
   }
   if (score >= 1.25) {
      return "A";
   }
   if (score >= 1) {
      return "B";
   }
   if (score >= 0.75) {
      return "C";
   }
   if (score >= 0.5) {
      return "D";
   }
   return "F";
}

// const data: number[][] = Array(100);
// console.log(data);
// for (let i = 0; i < 100; i++) {
//    data[i] = [round(damageAfterArmor(i), 4), round(damageAfterShield(i), 4), round(damageAfterDeflection(i), 4)];
// }
// console.table(data);
