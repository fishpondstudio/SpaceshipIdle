import { clamp, formatNumber, formatPercent, hasFlag, setFlag, type ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { RuntimeFlag } from "../logic/RuntimeFlag";
import type { IRuntimeEffect, RuntimeTile } from "../logic/RuntimeTile";
import { AbilityRange, abilityTarget } from "./Ability";
import { DamageType } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { ProjectileFlag } from "./ProjectileFlag";

export const StatusEffectFlag = {
   None: 0,
   Positive: 1 << 0,
   Negative: 1 << 1,
} as const;

export type StatusEffectFlag = ValueOf<typeof StatusEffectFlag>;

export const StatusEffectType = {
   Mechanical: 0,
   Electrical: 1,
   Chemical: 2,
} as const;

export type StatusEffectType = ValueOf<typeof StatusEffectType>;

export interface IStatusEffect {
   name: () => string;
   desc: (value: number) => string;
   flag: StatusEffectFlag;
   type: StatusEffectType;
   onAdded?: (value: number, rs: RuntimeTile) => void;
   onTick?: (se: IRuntimeEffect, rs: RuntimeTile) => void;
   onDestroyed?: (value: number, rs: RuntimeTile) => void;
   onDealingDamage?: (
      value: number,
      damage: number,
      damageType: DamageType,
      damageSource: RuntimeTile,
      damageTarget: RuntimeTile,
   ) => void;
   onTakingDamage?: (
      value: number,
      damage: number,
      damageType: DamageType,
      damageSource: RuntimeTile | undefined,
      damageTarget: RuntimeTile,
   ) => void;
}

export const StatusEffects = {
   TickExplosiveDamage: {
      name: () => t(L.TickExplosiveDamage),
      desc: (value) => t(L.TickExplosiveDamageDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Chemical,
      onTick: (se, rs) => {
         rs.takeDamage(se.value, DamageType.Explosive, ProjectileFlag.None, se.sourceType);
      },
   },
   TickEnergyDamage: {
      name: () => t(L.TickEnergyDamage),
      desc: (value) => t(L.TickEnergyDamageDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Chemical,
      onTick: (se, rs) => {
         rs.takeDamage(se.value, DamageType.Energy, ProjectileFlag.None, se.sourceType);
      },
   },
   TickKineticDamage: {
      name: () => t(L.TickKineticDamage),
      desc: (value) => t(L.TickKineticDamageDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.takeDamage(se.value, DamageType.Kinetic, ProjectileFlag.None, se.sourceType);
      },
   },
   RecoverHp: {
      name: () => t(L.RecoverHp),
      desc: (value) => t(L.RecoverHpDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.recoverHp(se.value);
      },
   },
   ReduceArmor: {
      name: () => t(L.ReduceArmor),
      desc: (value) => t(L.ReduceArmorDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.armor = clamp(rs.props.armor - se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   ReduceDeflection: {
      name: () => t(L.ReduceDeflection),
      desc: (value) => t(L.ReduceDeflectionDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.deflection = clamp(rs.props.deflection - se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   ReduceArmorAndShield: {
      name: () => t(L.ReduceArmorAndShield),
      desc: (value) => t(L.ReduceArmorAndShieldDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.armor = clamp(rs.props.armor - se.value, 0, Number.POSITIVE_INFINITY);
         rs.props.shield = clamp(rs.props.shield - se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   ReduceArmorAndDeflection: {
      name: () => t(L.ReduceArmorAndDeflection),
      desc: (value) => t(L.ReduceArmorAndDeflectionDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.armor = clamp(rs.props.armor - se.value, 0, Number.POSITIVE_INFINITY);
         rs.props.deflection = clamp(rs.props.deflection - se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   IncreaseArmor: {
      name: () => t(L.IncreaseArmor),
      desc: (value) => t(L.IncreaseArmorDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.armor = clamp(rs.props.armor + se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   IncreaseDeflection: {
      name: () => t(L.IncreaseDeflection),
      desc: (value) => t(L.IncreaseDeflectionDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.deflection = clamp(rs.props.deflection + se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   ReduceShield: {
      name: () => t(L.ReduceShield),
      desc: (value) => t(L.ReduceShieldDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.shield = clamp(rs.props.shield - se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   IncreaseShield: {
      name: () => t(L.IncreaseShield),
      desc: (value) => t(L.IncreaseShieldDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.shield = clamp(rs.props.shield + se.value, 0, Number.POSITIVE_INFINITY);
      },
   },
   IncreaseEvasion: {
      name: () => t(L.IncreaseEvasion),
      desc: (value) => t(L.IncreaseEvasionDesc, value),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.evasion = clamp(rs.props.evasion + se.value, 0, 1);
      },
   },
   CriticalDamage2: {
      name: () => t(L.CriticalDamage2),
      desc: (value) => t(L.CriticalDamage2Desc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.criticalDamages.push({ chance: se.value, multiplier: 2 });
      },
   },
   LifeSteal: {
      name: () => t(L.LifeSteal),
      desc: (value) => t(L.LifeStealDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onDealingDamage: (value, damage, damageType, damageSource, damageTarget) => {
         damageSource.recoverHp(damage * value);
      },
   },
   DamageControl: {
      name: () => t(L.DamageControl),
      desc: (value) => t(L.DamageControlDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.recoverHp(Math.floor(rs.damageTaken / rs.props.hp / 0.1) * se.value * rs.props.hp);
      },
   },
   IncreaseMaxHp: {
      name: () => t(L.IncreaseMaxHp),
      desc: (value) => t(L.IncreaseMaxHpDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.hp += se.value;
      },
   },
   ReduceDamage: {
      name: () => t(L.ReduceDamage),
      desc: (value) => t(L.ReduceDamageDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.damagePerProjectile = clamp(
            rs.props.damagePerProjectile - se.value / rs.props.projectiles,
            0,
            Number.POSITIVE_INFINITY,
         );
      },
   },
   IncreaseFireCooldown: {
      name: () => t(L.IncreaseFireCooldown),
      desc: (value) => t(L.IncreaseFireCooldownDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.fireCooldown += se.value;
      },
   },
   ReflectDamage: {
      name: () => t(L.ReflectDamage),
      desc: (value) => t(L.ReflectDamageDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTakingDamage: (value, damage, damageType, damageSource, damageTarget) => {
         damageSource?.takeDamage(damage * value, damageType, ProjectileFlag.None, damageTarget.data.type);
      },
   },
   RecoverHpOnTakingDamage2x: {
      name: () => t(L.RecoverHpOnTakingDamage2x),
      desc: (value) => t(L.RecoverHpOnTakingDamage2xDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTakingDamage: (value, damage, damageType, damageSource, damageTarget) => {
         if (damageTarget.runtime.random() < value) {
            damageTarget.recoverHp(damage * 2);
         }
      },
   },
   RecoverHpOnDealingDamage10: {
      name: () => t(L.RecoverHpOnDealingDamage10),
      desc: (value) => t(L.RecoverHpOnDealingDamage10Desc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onDealingDamage: (value, damage, damageType, damageSource, damageTarget) => {
         if (damageSource.runtime.random() < value) {
            damageSource.recoverHp(damageSource.props.hp * 0.1);
         }
      },
   },
   IncreaseMaxHpPct: {
      name: () => t(L.IncreaseMaxHpPct),
      desc: (value) => t(L.IncreaseMaxHpPctDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.props.hp *= 1 + se.value;
      },
   },
   IncreaseDamagePct: {
      name: () => t(L.DamageBoost),
      desc: (value) => t(L.DamageBoostDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.props.damagePerProjectile *= 1 + se.value;
      },
   },
   DispelBuff: {
      name: () => t(L.DispelBuff),
      desc: (value) => t(L.DispelBuffDesc),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         for (const [tile, re] of rs.statusEffects) {
            if (
               re.statusEffect !== se.statusEffect &&
               hasFlag(StatusEffects[re.statusEffect].flag, StatusEffectFlag.Positive)
            ) {
               rs.statusEffects.delete(tile);
            }
         }
      },
   },
   DispelDebuff: {
      name: () => t(L.DispelDebuff),
      desc: (value) => t(L.DispelDebuffDesc),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         for (const [tile, re] of rs.statusEffects) {
            if (
               re.statusEffect !== se.statusEffect &&
               hasFlag(StatusEffects[re.statusEffect].flag, StatusEffectFlag.Negative)
            ) {
               rs.statusEffects.delete(tile);
            }
         }
      },
   },
   IncreaseMaxHpAutoCannonCluster: {
      name: () => t(L.IncreaseMaxHpAutoCannonCluster),
      desc: (value) => t(L.IncreaseMaxHpAutoCannonClusterDesc, formatPercent(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         let count = 0;
         abilityTarget(rs.side, AbilityRange.Adjacent, rs.tile, rs.runtime.tiles).forEach((tile) => {
            const building = rs.runtime.tiles.get(tile)?.data.type;
            if (building && Config.Buildings[building].code === CodeNumber.AC) {
               ++count;
            }
         });
         rs.props.hp *= 1 + 0.1 * count;
      },
   },
   Disarm: {
      name: () => t(L.Disarm),
      desc: (value) => t(L.DisarmDesc),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.props.runtimeFlag = setFlag(rs.props.runtimeFlag, RuntimeFlag.NoFire);
      },
   },
   Wreckage: {
      name: () => t(L.Wreckage),
      desc: (value) => t(L.WreckageDesc),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.props.runtimeFlag = setFlag(rs.props.runtimeFlag, RuntimeFlag.NoFire);
      },
   },
   LaserBlocker: {
      name: () => t(L.LaserBlocker),
      desc: (value) => t(L.LaserBlockerDesc),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.props.runtimeFlag = setFlag(rs.props.runtimeFlag, RuntimeFlag.BlockLaser);
      },
   },
   IgnoreEvasion: {
      name: () => t(L.IgnoreEvasion),
      desc: (value) => t(L.IgnoreEvasionDesc),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.props.runtimeFlag = setFlag(rs.props.projectileFlag, ProjectileFlag.NoEvasion);
      },
   },
   FailsafeRegen: {
      name: () => t(L.FailsafeRegen),
      desc: (value) => t(L.FailsafeRegenDesc),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         if (rs.damageTaken >= rs.props.hp * 0.9) {
            rs.recoverHp(rs.props.hp * 0.05);
         }
      },
   },
   LastStandRegen: {
      name: () => t(L.LastStandRegen),
      desc: (value) => t(L.LastStandRegenDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onDestroyed: (value, rs) => {
         const parent = rs.parent;
         if (!parent) return;
         abilityTarget(rs.side, AbilityRange.Adjacent, rs.tile, parent.tiles).forEach((tile) => {
            if (tile === rs.tile) return;
            rs.runtime.get(tile)?.recoverHp(value);
         });
      },
   },
   ReduceMaxHp: {
      name: () => t(L.ReduceMaxHp),
      desc: (value) => t(L.ReduceMaxHpDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.hp -= se.value;
      },
   },
} as const satisfies Record<string, IStatusEffect>;

export function statusEffectOf(key: StatusEffect): IStatusEffect {
   return StatusEffects[key];
}

export type StatusEffect = keyof typeof StatusEffects;
