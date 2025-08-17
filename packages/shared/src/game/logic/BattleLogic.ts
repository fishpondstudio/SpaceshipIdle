import { hasFlag, mapSafeAdd, reduceOf, setFlag, type Tile, tileToPoint } from "../../utils/Helper";
import { TypedEvent } from "../../utils/TypedEvent";
import type { IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import { AbilityTiming, abilityTarget } from "../definitions/Ability";
import { BuildingFlag, ProjectileFlag, WeaponKey } from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { BattleStartAmmoCycles, BattleTickInterval, DefaultCooldown, MaxBattleTick } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import { GameOption } from "../GameOption";
import { GameData, GameState } from "../GameState";
import { posToTile } from "../Grid";
import { BattleStatus } from "./BattleStatus";
import { BattleFlag, BattleType } from "./BattleType";
import { getDamagePerFire } from "./BuildingLogic";
import { Projectile } from "./Projectile";
import { Runtime } from "./Runtime";
import type { RuntimeStat } from "./RuntimeStat";
import { RuntimeFlag, type RuntimeTile } from "./RuntimeTile";
import { calculateAABB } from "./ShipLogic";
import { Side } from "./Side";

interface IProjectileHit {
   position: IHaveXY;
   tile: Tile;
   critical: boolean;
}

export const OnWeaponFire = new TypedEvent<{ from: Tile; to: Tile }>();
export const OnProjectileHit = new TypedEvent<IProjectileHit>();
export const OnDamaged = new TypedEvent<{ tile: Tile; amount: number }>();
export const OnEvasion = new TypedEvent<{ tile: Tile }>();
export const RequestFloater = new TypedEvent<{ tile: Tile; amount: number }>();

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
      if (
         (side === Side.Right && targets.tiles.size > 0 && point.x > aabb.max.x) ||
         (side === Side.Left && targets.tiles.size > 0 && point.x < aabb.min.x)
      ) {
         projectiles.delete(id);
         return;
      }
      let target = targets.tiles.get(tile);
      if (
         hasFlag(projectile.flag, ProjectileFlag.DroneDamage) &&
         targets.tiles.has(projectile.toTile) &&
         tile !== projectile.toTile
      ) {
         target = undefined;
      }
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
                  ability.value(projectile.building, projectile.level, projectile.multipliers) * factor,
                  ability.duration(projectile.building, projectile.level, projectile.multipliers),
               );
            });
         }
         runtime.emit(OnProjectileHit, { position: pos, tile: tile, critical: projectile.critical });
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
   let lowestHp: RuntimeTile | undefined;
   let lowestHpPct: RuntimeTile | undefined;

   to.tiles.forEach((data, tile) => {
      const rs = rt.get(tile);
      if (!rs) {
         return;
      }
      if (rs.isDead) {
         return;
      }
      if (!lowestHp || rs.currentHp < lowestHp.currentHp) {
         lowestHp = rs;
      }
      if (!lowestHpPct || rs.hpPct < lowestHpPct.hpPct) {
         lowestHpPct = rs;
      }
   });

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
      if (hasFlag(rs.props.runtimeFlag, RuntimeFlag.NoFire)) {
         return;
      }
      rs.cooldown += BattleTickInterval;
      if (rs.cooldown < rs.props.fireCooldown) {
         return;
      }
      const point = tileToPoint(tile);
      let target = rs.target;
      // `target` is no longer valid, will need to re-target
      if (target && !to.tiles.has(target)) {
         rs.target = undefined;
         target = undefined;
      }
      if (hasFlag(def.projectileFlag, ProjectileFlag.DroneDamage)) {
         target = lowestHpPct?.tile;
      } else if (!target) {
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
         rs.cooldown = 0;
         rs.target = target;

         const damagePerFire =
            getDamagePerFire({ type: data.type, level: data.level }) *
            (rs.hpMultiplier.value + rs.damageMultiplier.value);

         mapSafeAdd<Resource>(from.resources, "XP", damagePerFire);
         RequestFloater.emit({ tile, amount: damagePerFire });

         const ability = rs.props.ability;
         if (ability?.timing === AbilityTiming.OnFire) {
            abilityTarget(side, ability.range, tile, from.tiles).forEach((target) => {
               const statusEffectTarget = rt.get(target);
               if (!statusEffectTarget) return;
               statusEffectTarget.addStatusEffect(
                  ability.effect,
                  tile,
                  rs.data.type,
                  ability.value(rs.data.type, rs.data.level, rs.multipliers),
                  ability.duration(rs.data.type, rs.data.level, rs.multipliers),
               );
            });
         }
         rt.emit(OnWeaponFire, { from: tile, to: target });
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
                     rs.multipliers,
                     rs.props.ability,
                     rs.projectileMag,
                  ),
               );
            }, 0.1 * i);
         }
      }
   });

   if (projectiles.size === 0) {
      stat.zeroProjectileSec += BattleTickInterval;
   } else {
      stat.zeroProjectileSec = 0;
   }
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

export function simulateBattle(ship: GameState, reference: GameState): Runtime {
   const me = structuredClone(ship);
   me.resources.clear();
   const enemy = structuredClone(reference);
   enemy.resources.clear();

   const rt = new Runtime({ state: me, options: new GameOption(), data: new GameData() }, enemy);
   rt.battleType = BattleType.Qualifier;
   rt.battleFlag = setFlag(rt.battleFlag, BattleFlag.Silent);
   const speed = { speed: 1 };
   while (rt.battleStatus === BattleStatus.InProgress && rt.productionTick <= MaxBattleTick) {
      rt.tick(BattleTickInterval, speed);
   }
   if (rt.productionTick >= MaxBattleTick) {
      console.log(`${ship.name} (${ship.id}) vs ${reference.name} (${reference.id}): ${rt.productionTick}s`);
   }
   return rt;
}

const CalcShipScoreTicks = 50;

export function calcShipScore(ship: GameState): [number, number, number, Runtime] {
   const me = structuredClone(ship);
   me.resources.clear();
   const rt = new Runtime({ state: me, options: new GameOption(), data: new GameData() }, new GameState());
   rt.wave = Number.POSITIVE_INFINITY;
   rt.createXPTarget();
   rt.battleType = BattleType.Peace;
   rt.battleFlag = setFlag(rt.battleFlag, BattleFlag.Silent);
   const speed = { speed: 1 };
   for (let i = 0; i < (CalcShipScoreTicks + BattleStartAmmoCycles * 10) / BattleTickInterval; i++) {
      rt.tick(BattleTickInterval, speed);
   }
   const dps = reduceOf(rt.rightStat.averageRawDamage(CalcShipScoreTicks), (prev, k, v) => prev + v, 0);

   // 68.9%
   // rt.left.tiles.forEach((data, tile) => {
   //    const rs = rt.get(tile);
   //    if (rs) {
   //       rs.takeDamage(1, DamageType.Kinetic, ProjectileFlag.None, null);
   //       rs.takeDamage(1, DamageType.Explosive, ProjectileFlag.None, null);
   //       rs.takeDamage(1, DamageType.Energy, ProjectileFlag.None, null);
   //    }
   // });
   // rt.tick(BattleTickInterval, speed);
   // const actualToRaw =
   //    reduceOf(rt.leftStat.actualDamage, (prev, k, v) => prev + v, 0) /
   //    reduceOf(rt.leftStat.rawDamage, (prev, k, v) => prev + v, 0);

   // 69.54%
   // let i = 1;
   // while (rt.left.tiles.size > 0) {
   //    rt.tick(BattleTickInterval, speed);
   //    rt.left.tiles.forEach((data, tile) => {
   //       const rs = rt.get(tile);
   //       if (rs) {
   //          rs.takeDamage(i * BattleTickInterval, DamageType.Kinetic, ProjectileFlag.None, null);
   //          rs.takeDamage(i * BattleTickInterval, DamageType.Explosive, ProjectileFlag.None, null);
   //          rs.takeDamage(i * BattleTickInterval, DamageType.Energy, ProjectileFlag.None, null);
   //       }
   //    });
   //    ++i;
   // }
   // const hp = reduceOf(rt.leftStat.rawDamage, (prev, k, v) => prev + v, 0);

   // 69.35%
   const hp = rt.leftStat.maxHp;
   return [Math.sqrt((hp * dps) / 1000), hp / 100, dps / 10, rt];
}

// const data: number[][] = Array(100);
// console.log(data);
// for (let i = 0; i < 100; i++) {
//    data[i] = [round(damageAfterArmor(i), 4), round(damageAfterShield(i), 4), round(damageAfterDeflection(i), 4)];
// }
// console.table(data);
