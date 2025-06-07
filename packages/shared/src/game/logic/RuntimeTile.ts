import { Rounding, type Tile, type ValueOf, forEach, hasFlag, mapSafeAdd, round, safeAdd } from "../../utils/Helper";
import { Config } from "../Config";
import { GameStateUpdated } from "../GameState";
import type { ITileData } from "../ITileData";
import {
   DamageType,
   type DefenseProp,
   type IBuildingDefinition,
   type IDefenseProp,
   type IWeaponDefinition,
   type IWeaponProp,
   ProjectileFlag,
   type Property,
   WeaponKey,
   type WeaponProp,
} from "../definitions/BuildingProps";
import type { Building } from "../definitions/Buildings";
import { DefaultCooldown, StatusEffectTickInterval } from "../definitions/Constant";
import type { Resource } from "../definitions/Resource";
import { type StatusEffect, statusEffectOf } from "../definitions/StatusEffect";
import {
   OnDamaged,
   OnEvasion,
   damageAfterArmor,
   damageAfterDeflection,
   damageAfterShield,
   evasionChance,
   getCooldownMultiplier,
} from "./BattleLogic";
import { BattleType } from "./BattleType";
import { damageToHp, getNormalizedValue } from "./BuildingLogic";
import type { IMultiplier } from "./IMultiplier";
import type { Runtime } from "./Runtime";
import { isEnemy } from "./ShipLogic";
import { Side } from "./Side";

export const RuntimeFlag = {
   None: 0,
   NoPower: 1 << 0,
   NoProduction: 1 << 1,
   NoFire: 1 << 2,
   BlockLaser: 1 << 3,
} as const;

export type RuntimeFlag = ValueOf<typeof RuntimeFlag>;

export interface IRuntimeEffect {
   statusEffect: StatusEffect;
   sourceType: Building;
   value: number;
   timeLeft: number;
}

export type RuntimeProps = DefenseProp &
   Omit<WeaponProp, "damagePct"> & {
      hp: number;
      damagePerProjectile: number;
      lifeTime: number;
      runtimeFlag: RuntimeFlag;
   };

export interface ICriticalDamage {
   chance: number;
   multiplier: number;
}

export class RuntimeTile {
   public target: Tile | null = null;
   public readonly insufficient: Set<Resource> = new Set();
   public cooldown = Number.POSITIVE_INFINITY;
   public readonly statusEffects = new Map<Tile, IRuntimeEffect>();

   public readonly productionMultiplier = new Multiplier();
   public readonly xpMultiplier = new Multiplier();

   public readonly criticalDamages: ICriticalDamage[] = [];

   private _damageTaken = 0;

   //#region Properties
   public props: RuntimeProps = {
      hp: 0,
      damagePerProjectile: 0,
      lifeTime: Number.POSITIVE_INFINITY,
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
      lifeTime: Number.POSITIVE_INFINITY,
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
         if (this.runtime.battleType !== BattleType.Simulated) {
            OnEvasion.emit({ tile: this.tile });
         }
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
      if (this.runtime.battleType !== BattleType.Simulated) {
         OnDamaged.emit({ tile: this.tile, amount: damage });
      }
      return damage;
   }

   public recoverHp(amount: number): void {
      if (this._damageTaken >= amount) {
         this._damageTaken -= amount;
      } else {
         amount = this._damageTaken;
         this._damageTaken = 0;
      }
      if (this.runtime.battleType !== BattleType.Simulated) {
         OnDamaged.emit({ tile: this.tile, amount: -amount });
      }
   }

   public get isDead(): boolean {
      return this._damageTaken >= this.props.hp;
   }

   public get side(): Side {
      return isEnemy(this.tile) ? Side.Right : Side.Left;
   }

   public get damageTaken(): number {
      return this._damageTaken;
   }

   public get def(): IWeaponDefinition | IBuildingDefinition {
      return Config.Buildings[this.data.type];
   }

   public matchCapacity(): void {
      if (WeaponKey in this.def) {
         this.data.capacity = round(1 / (DefaultCooldown * this.productionMultiplier.value), 2, Rounding.Ceil);
         GameStateUpdated.emit();
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
      const props = def as IWeaponProp & IDefenseProp;
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
      const normVal = getNormalizedValue(this.data);
      this.props.hp = damageToHp(normVal, this.data.type);
      if ("lifeTime" in def) {
         this.props.lifeTime = def.lifeTime;
      }
      if (WeaponKey in def) {
         const dmg = normVal * getCooldownMultiplier(this.data);
         this.props.damagePerProjectile = (def.damagePct * dmg) / def.projectiles;
      }
      Object.assign(this.originalProps, this.props);
      this.props.runtimeFlag = RuntimeFlag.None;
   }
}

function propertyValue(p: Property, level: number): number {
   return p[0] + level * p[1];
}

export class Multiplier {
   private readonly _multipliers: IMultiplier[] = [];
   private _multiplierValue = 1;

   public add(value: number, source: string): void {
      this._multipliers.push({ value, source });
      this._multiplierValue += value;
   }

   public clear(): void {
      this._multipliers.length = 0;
      this._multiplierValue = 1;
   }

   public get value(): number {
      return this._multiplierValue;
   }

   public get detail(): IMultiplier[] {
      return this._multipliers;
   }
}
