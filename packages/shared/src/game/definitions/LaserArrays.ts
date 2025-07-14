import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getDamagePerFire } from "../logic/BuildingLogic";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import {
   BaseWeaponProps,
   BuildingFlag,
   DamageType,
   type IDefenseProp,
   type IWeaponDefinition,
   ProjectileFlag,
} from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { LaserArrayDamagePct } from "./Constant";

export const LaserArrayDefenseProps: IDefenseProp = {
   armor: [0, 0.5],
   shield: [0, 1],
   deflection: [0, 0.5],
   evasion: [0, 0],
} as const;

export const LA1: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "V",
};
export const LA1A: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1A),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.1 * LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "As",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return (damage * (1 - def.damagePct) * LaserArrayDamagePct) / 2;
      },
      duration: (building, level) => 2,
   },
};
export const LA1B: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1B),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Mo",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceArmorAndDeflection",
      flag: AbilityFlag.None,
      value: (self, level) => {
         return level / 2;
      },
      duration: (self, level) => 2,
   },
};
export const LA2: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA2),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.5 * LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Rh",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceMaxHp",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const normVal = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return (normVal * 2.5 * (1 - def.damagePct) * LaserArrayDamagePct) / 2;
      },
      duration: (building, level) => 2,
   },
};
export const LA2A: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA2A),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.5 * LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Pd",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const normVal = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return normVal * (1 - def.damagePct) * LaserArrayDamagePct;
      },
      duration: (building, level) => 2,
   },
};
