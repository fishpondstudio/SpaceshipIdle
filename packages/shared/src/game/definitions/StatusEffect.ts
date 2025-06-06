import { clamp, formatNumber, formatPercent, hasFlag, type ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import type { IRuntimeEffect, RuntimeTile } from "../logic/RuntimeTile";
import { DamageType } from "./BuildingProps";

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
         rs.takeDamage(se.value, DamageType.Explosive, se.sourceType);
      },
   },
   TickEnergyDamage: {
      name: () => t(L.TickEnergyDamage),
      desc: (value) => t(L.TickEnergyDamageDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Chemical,
      onTick: (se, rs) => {
         rs.takeDamage(se.value, DamageType.Energy, se.sourceType);
      },
   },
   TickKineticDamage: {
      name: () => t(L.TickKineticDamage),
      desc: (value) => t(L.TickKineticDamageDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.takeDamage(se.value, DamageType.Kinetic, se.sourceType);
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
   ReduceDamagePerProjectile: {
      name: () => t(L.ReduceDamagePerProjectile),
      desc: (value) => t(L.ReduceDamagePerProjectileDesc, formatNumber(value)),
      flag: StatusEffectFlag.Negative,
      type: StatusEffectType.Mechanical,
      onTick: (se, rs) => {
         rs.props.damagePerProjectile = clamp(rs.props.damagePerProjectile - se.value, 0, Number.POSITIVE_INFINITY);
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
         damageSource?.takeDamage(damage * value, damageType, damageTarget.data.type);
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
   ProductionMultiplierBoost: {
      name: () => t(L.ProductionMultiplierBoost),
      desc: (value) => t(L.ProductionMultiplierBoostDesc, formatNumber(value)),
      flag: StatusEffectFlag.Positive,
      type: StatusEffectType.Electrical,
      onTick: (se, rs) => {
         rs.productionMultiplier.add(se.value, Config.Buildings[se.sourceType].name());
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
   DispelBuffEffect: {
      name: () => t(L.DispelBuffEffect),
      desc: (value) => t(L.DispelBuffEffectDesc),
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
} as const satisfies Record<string, IStatusEffect>;

export function statusEffectOf(key: StatusEffect): IStatusEffect {
   return StatusEffects[key];
}

export type StatusEffect = keyof typeof StatusEffects;
