import { forEach, hasFlag, mapSafeAdd, safeAdd, type Tile, type ValueOf } from "../../utils/Helper";
import { TypedEvent } from "../../utils/TypedEvent";
import { Config } from "../Config";
import type { Booster } from "../definitions/Boosters";
import {
   type BuildingProp,
   DamageType,
   type IBuildingDefinition,
   type IBuildingProp,
   ProjectileFlag,
   type Property,
   WeaponKey,
} from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { StatusEffectTickInterval } from "../definitions/Constant";
import { type StatusEffect, StatusEffectFlag, statusEffectOf, StatusEffects } from "../definitions/StatusEffect";
import type { GameState } from "../GameState";
import { GridSize } from "../Grid";
import type { ITileData } from "../ITileData";
import {
   damageAfterArmor,
   damageAfterDeflection,
   damageAfterShield,
   evasionChance,
   OnDamaged,
   OnEvasion,
} from "./BattleLogic";
import { getDamagePerFire, getHP } from "./BuildingLogic";
import type { Multipliers } from "./IMultiplier";
import type { Runtime } from "./Runtime";
import { isEnemy } from "./ShipLogic";
import { Side } from "./Side";
import { TrackedValue } from "./TrackedValue";

export const RuntimeFlag = {
   None: 0,
   NoFire: 1 << 0,
   BlockLaser: 1 << 1,
} as const;

export type RuntimeFlag = ValueOf<typeof RuntimeFlag>;

export interface IRuntimeEffect {
   statusEffect: StatusEffect;
   sourceType: Building;
   value: number;
   timeLeft: number;
}

export type RuntimeProps = Omit<BuildingProp, "damagePct"> & {
   hp: number;
   damagePerProjectile: number;
   runtimeFlag: RuntimeFlag;
};

export interface ICriticalDamage {
   chance: number;
   multiplier: number;
}

export const OnStatusEffectsChanged = new TypedEvent<{ tile: Tile; buff: number; debuff: number }>();

export class RuntimeTile {
   public target: Tile | undefined;
   public cooldown = Number.POSITIVE_INFINITY;
   public readonly statusEffects = new Map<Tile, IRuntimeEffect>();
   public buff = 0;
   public debuff = 0;

   public booster: Booster | null = null;

   public readonly hpMultiplier = new TrackedValue(1);
   public readonly damageMultiplier = new TrackedValue(1);

   public readonly criticalDamages: ICriticalDamage[] = [];

   private _damageTaken = 0;

   //#region Properties
   public props: RuntimeProps = {
      hp: 0,
      damagePerProjectile: 0,
      armor: 0,
      shield: 0,
      deflection: 0,
      evasion: 0,
      fireCooldown: 0,
      projectiles: 0,
      projectileSpeed: 0,
      damageType: DamageType.Kinetic,
      projectileFlag: ProjectileFlag.None,
      ability: undefined,
      runtimeFlag: RuntimeFlag.None,
   };
   public originalProps: RuntimeProps = {
      hp: 0,
      damagePerProjectile: 0,
      armor: 0,
      shield: 0,
      deflection: 0,
      evasion: 0,
      fireCooldown: 0,
      projectiles: 0,
      projectileSpeed: 0,
      damageType: DamageType.Kinetic,
      projectileFlag: ProjectileFlag.None,
      ability: undefined,
      runtimeFlag: RuntimeFlag.None,
   };
   //#endregion

   constructor(
      public readonly tile: Tile,
      public readonly data: ITileData,
      public readonly runtime: Runtime,
   ) {
      this._copyProps();
   }

   public takeDamage(
      damage: number,
      damageType: DamageType,
      projectileFlag: ProjectileFlag,
      source: Building | null,
   ): number {
      const stat = isEnemy(this.tile) ? this.runtime.rightStat : this.runtime.leftStat;

      if (
         !hasFlag(projectileFlag, ProjectileFlag.NoEvasion) &&
         this.props.evasion > 0 &&
         this.runtime.random() < evasionChance(this.props.evasion)
      ) {
         this.runtime.emit(OnEvasion, { tile: this.tile });
         return 0;
      }

      safeAdd(stat.rawDamagePerSec, damageType, damage);
      if (damageType === DamageType.Kinetic) {
         damage = damage * damageAfterArmor(this.props.armor);
      }
      if (damageType === DamageType.Explosive) {
         damage = damage * damageAfterShield(this.props.armor);
      }
      if (damageType === DamageType.Energy) {
         damage = damage * damageAfterDeflection(this.props.deflection);
      }

      safeAdd(stat.actualDamagePerSec, damageType, damage);
      if (source) {
         mapSafeAdd(stat.actualDamageByBuilding, source, damage);
      }
      this._damageTaken += damage;
      this.runtime.emit(OnDamaged, { tile: this.tile, amount: damage });
      return damage;
   }

   public recoverHp(amount: number): void {
      if (this._damageTaken >= amount) {
         this._damageTaken -= amount;
      } else {
         amount = this._damageTaken;
         this._damageTaken = 0;
      }
      this.runtime.emit(OnDamaged, { tile: this.tile, amount: -amount });
   }

   public get isDead(): boolean {
      return this._damageTaken >= this.props.hp;
   }

   public get side(): Side {
      return isEnemy(this.tile) ? Side.Right : Side.Left;
   }

   public get parent(): GameState | null {
      if (this.runtime.left.tiles.has(this.tile)) {
         return this.runtime.left;
      }
      if (this.runtime.right.tiles.has(this.tile)) {
         return this.runtime.right;
      }
      return null;
   }

   public get damageTaken(): number {
      return this._damageTaken;
   }

   public get currentHp(): number {
      return this.props.hp - this._damageTaken;
   }

   public get hpPct(): number {
      return this.currentHp / this.props.hp;
   }

   public get def(): IBuildingDefinition | IBuildingDefinition {
      return Config.Buildings[this.data.type];
   }

   public get projectileMag(): number {
      if (hasFlag(this.props.projectileFlag, ProjectileFlag.DroneDamage)) {
         return GridSize;
      }
      return 0;
   }

   public get multipliers(): Required<Multipliers> {
      return {
         hp: this.hpMultiplier.value,
         damage: this.damageMultiplier.value,
      };
   }

   private _tabulate(): void {
      const oldBuff = this.buff;
      const oldDebuff = this.debuff;
      this.buff = 0;
      this.debuff = 0;
      for (const [_, se] of this.statusEffects) {
         if (hasFlag(StatusEffects[se.statusEffect].flag, StatusEffectFlag.Positive)) {
            ++this.buff;
         }
         if (hasFlag(StatusEffects[se.statusEffect].flag, StatusEffectFlag.Negative)) {
            ++this.debuff;
         }
      }
      if (oldBuff !== this.buff || oldDebuff !== this.debuff) {
         this.runtime.emit(OnStatusEffectsChanged, { tile: this.tile, buff: this.buff, debuff: this.debuff });
      }
   }

   public addStatusEffect(
      effect: StatusEffect,
      source: Tile,
      sourceType: Building,
      value: number,
      duration: number,
   ): void {
      this.statusEffects.set(source, { statusEffect: effect, sourceType, value: value, timeLeft: duration });
      statusEffectOf(effect).onAdded?.(value, this);
   }

   public tickStatusEffect(): void {
      this._copyProps();
      for (const [tile, se] of this.statusEffects) {
         if (se.timeLeft <= 0) {
            this.statusEffects.delete(tile);
         }
         statusEffectOf(se.statusEffect).onTick?.(se, this);
         se.timeLeft -= StatusEffectTickInterval;
      }
      this._tabulate();
   }

   public onDestroyed(): void {
      for (const [_, se] of this.statusEffects) {
         statusEffectOf(se.statusEffect).onDestroyed?.(se.value, this);
      }
   }

   public onDealingDamage(damage: number, damageType: DamageType, damageTarget: RuntimeTile): void {
      for (const [_, se] of this.statusEffects) {
         statusEffectOf(se.statusEffect).onDealingDamage?.(se.value, damage, damageType, this, damageTarget);
      }
   }

   public onTakingDamage(damage: number, damageType: DamageType, damageSource: RuntimeTile | undefined): void {
      for (const [_, se] of this.statusEffects) {
         statusEffectOf(se.statusEffect).onTakingDamage?.(se.value, damage, damageType, damageSource, this);
      }
   }

   public rollDamage(): [number, boolean] {
      this.criticalDamages.sort((a, b) => b.multiplier - a.multiplier);
      for (const cd of this.criticalDamages) {
         if (this.runtime.random() < cd.chance) {
            return [this.props.damagePerProjectile * cd.multiplier, true];
         }
      }
      return [this.props.damagePerProjectile, false];
   }

   private _copyProps(): void {
      this.criticalDamages.length = 0;

      const def = Config.Buildings[this.data.type];
      const props = def as IBuildingProp;
      forEach(props, (k, v) => {
         if (k in this.props) {
            const key = k as keyof typeof this.props;
            if (Array.isArray(v) && v.length === 2) {
               (this.props[key] as unknown) = propertyValue(v, this.data.level);
            } else {
               (this.props[key] as unknown) = v;
            }
         }
      });
      this.props.hp = getHP(this.data) * this.hpMultiplier.value;
      if (WeaponKey in def) {
         const damagePerFire = getDamagePerFire(this.data) * this.damageMultiplier.value;
         this.props.damagePerProjectile = (def.damagePct * damagePerFire) / def.projectiles;
      }
      Object.assign(this.originalProps, this.props);
      this.props.runtimeFlag = RuntimeFlag.None;
   }
}

function propertyValue(p: Property, level: number): number {
   return p[0] + level * p[1];
}
