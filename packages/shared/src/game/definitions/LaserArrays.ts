import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getDamagePerFire } from "../logic/BuildingLogic";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import {
   BuildingFlag,
   DamageType,
   type IBuildingDefinition,
   type IBuildingProp,
   ProjectileFlag,
} from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { DefaultCooldown, LaserArrayDamagePct } from "./Constant";

export const LaserArrayBaseProps: IBuildingProp = {
   armor: [0, 0.5],
   shield: [0, 1],
   deflection: [0, 0.5],
   evasion: [0, 0],
   damagePct: 1,
   fireCooldown: DefaultCooldown,
   projectiles: 1,
   projectileSpeed: 300,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const LA1: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Goby),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "V",
};
export const LA1A: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Tetra),
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
         const def = Config.Buildings[building] as IBuildingDefinition;
         const damage = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return (damage * (1 - def.damagePct) * LaserArrayDamagePct) / 2;
      },
      duration: (building, level) => 2,
   },
};
export const LA1B: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Danio),
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
export const LA2: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Perch),
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
         const def = Config.Buildings[building] as IBuildingDefinition;
         const normVal = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return (normVal * 2.5 * (1 - def.damagePct) * LaserArrayDamagePct) / 2;
      },
      duration: (building, level) => 2,
   },
};
export const LA2A: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Pike),
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
         const def = Config.Buildings[building] as IBuildingDefinition;
         const normVal = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return normVal * (1 - def.damagePct) * LaserArrayDamagePct;
      },
      duration: (building, level) => 2,
   },
};
export const LA2B: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Pike),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.5 * LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Pd",
   // ability: {
   //    timing: AbilityTiming.OnHit,
   //    range: AbilityRange.Single,
   //    effect: "ReduceDamage",
   //    flag: AbilityFlag.AffectedByDamageMultiplier,
   //    value: (building, level, multipliers) => {
   //       const def = Config.Buildings[building] as IBuildingDefinition;
   //       const normVal = getDamagePerFire({ type: building, level }) * multipliers.damage;
   //       return normVal * (1 - def.damagePct) * LaserArrayDamagePct;
   //    },
   //    duration: (building, level) => 2,
   // },
};
