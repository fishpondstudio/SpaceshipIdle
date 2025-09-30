import { L, t } from "../../utils/i18n";
import {
   AbilityFlag,
   AbilityRange,
   AbilityStatDamagePct,
   AbilityTiming,
   abilityChance,
   abilityDamage,
   criticalDamagePct,
} from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { DamageToHPMultiplier, DefaultCooldown } from "./Constant";
import { ProjectileFlag } from "./ProjectileFlag";

export const MissileBaseProps: IBuildingProp = {
   armor: [0, 1],
   shield: [0, 0.5],
   deflection: [0, 0.5],
   evasion: [0, 0],
   damagePct: 1,
   fireCooldown: DefaultCooldown,
   projectiles: 1,
   projectileSpeed: 300,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const MS1: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Wren),
   code: CodeNumber.MS,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: abilityDamage,
      duration: (building, level) => 5,
   },
   element: "Sc",
};
export const MS1A: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Lark),
   code: CodeNumber.MS,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHp",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: abilityDamage,
      duration: (building, level) => 2,
   },
   element: "Ti",
};

export const MS1B: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Shrike),
   code: CodeNumber.MS,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IncreaseMaxHp",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         return abilityDamage(building, level, multipliers) * DamageToHPMultiplier;
      },
      duration: (building, level) => 5,
   },
   element: "V",
};
export const MS1C: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Robin),
   code: CodeNumber.MS,
   damagePct: criticalDamagePct(0.2, 2),
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "CriticalDamage2",
      flag: AbilityFlag.None,
      value: (building, level) => 0.2,
      duration: (building, level) => 5,
   },
   element: "Cr",
};
export const MS2: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Pipit),
   code: CodeNumber.MS,
   damagePct: 0.8,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "DamageControl",
      flag: AbilityFlag.None,
      value: (building, level) => 0.01,
      duration: (building, level) => 4,
   },
   element: "Mn",
};
export const MS2A: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Warbler),
   code: CodeNumber.MS,
   damagePct: 0.75,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "ReflectDamage",
      flag: AbilityFlag.None,
      value: abilityChance,
      duration: (building, level) => 5,
   },
   element: "Fe",
};
export const MS2B: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Tanager),
   code: CodeNumber.MS,
   damagePct: AbilityStatDamagePct,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.FrontTrio,
      effect: "DispelDebuff",
      flag: AbilityFlag.None,
      value: (building, level) => 0,
      duration: (building, level) => 1,
   },
   element: "Co",
};
export const MS3: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Gull),
   code: CodeNumber.MS,
   damagePct: AbilityStatDamagePct,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.RearTrio,
      effect: "DispelBuff",
      flag: AbilityFlag.None,
      value: (building, level) => 0,
      duration: (building, level) => 1,
   },
   element: "Ni",
};
export const MS3A: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Jay),
   code: CodeNumber.MS,
   damagePct: 0.8,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LifeSteal",
      flag: AbilityFlag.None,
      value: (building, level) => 0.25,
      duration: (building, level) => 4,
   },
   element: "Cu",
};

export const MS3B: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Dove),
   code: CodeNumber.MS,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "Disarm",
      flag: AbilityFlag.None,
      value: (building, level) => {
         return 0;
      },
      duration: (building, level) => 2,
   },
   element: "Zn",
};

export const MS4: IBuildingDefinition = {
   ...MissileBaseProps,
   pet: () => t(L.Dove),
   code: CodeNumber.MS,
   damagePct: 0.9,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   element: "Y",
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "FailsafeRegen",
      flag: AbilityFlag.None,
      value: (building, level) => 0,
      duration: (building, level) => 5,
   },
};
