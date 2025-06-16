import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getCooldownMultiplier } from "../logic/BattleLogic";
import { getNormalizedValue } from "../logic/BuildingLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
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
   input: { Power: 4, U: 2, MS1H: 2 },
   output: { LA1: 1 },
   damagePct: LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "V",
};
export const LA1E: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1E),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 4, LA1: 2 },
   output: { LA1E: 1 },
   damagePct: 0.1 * LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "As",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct) * LaserArrayDamagePct) / 2;
      },
      duration: (building, level) => 2,
   },
};
export const LA1S: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1S),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, LA1E: 1 },
   output: { LA1S: 1 },
   damagePct: LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Mo",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceArmorAndDeflection",
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
   input: { Power: 2, LA1E: 2 },
   output: { LA2: 1 },
   damagePct: 0.5 * LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Rh",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceMaxHp",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const normVal = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (normVal * 2.5 * (1 - def.damagePct) * LaserArrayDamagePct) / 2;
      },
      duration: (building, level) => 2,
   },
};
export const LA2D: IWeaponDefinition = {
   ...LaserArrayDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA2D),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, LA2: 1, MS2S: 1 },
   output: { LA2D: 1 },
   damagePct: 0.5 * LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Pd",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const normVal = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return normVal * (1 - def.damagePct) * LaserArrayDamagePct;
      },
      duration: (building, level) => 2,
   },
};
