import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityRange, AbilityStatDamagePct, AbilityTiming, abilityDamage, abilityStat } from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { BuildingType } from "./CodeNumber";
import { DamageToHPMultiplier, DefaultCooldown, LaserArrayDamagePct } from "./Constant";
import { ProjectileFlag } from "./ProjectileFlag";

export const LaserArrayBaseProps: IBuildingProp = {
   armor: [0, 0.5],
   shield: [0, 1],
   deflection: [0, 0.5],
   evasion: [0, 0],
   damagePct: LaserArrayDamagePct,
   fireCooldown: DefaultCooldown,
   projectiles: 1,
   projectileSpeed: 300,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const LA1: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Goby),
   type: BuildingType.LA,
   damagePct: LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "La",
};

export const LA1A: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Tetra),
   type: BuildingType.LA,
   damagePct: 0.1 * LaserArrayDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Ce",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickEnergyDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: abilityDamage,
      duration: (building, level) => 2,
   },
};
export const LA1B: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Danio),
   type: BuildingType.LA,
   damagePct: LaserArrayDamagePct * AbilityStatDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Pr",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceArmorAndDeflection",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 2,
   },
};
export const LA2: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Perch),
   type: BuildingType.LA,
   damagePct: LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Nd",
};
export const LA2A: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Pike),
   type: BuildingType.LA,
   damagePct: 0.5 * LaserArrayDamagePct,
   fireCooldown: 3.5,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Pm",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceMaxHp",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         return abilityDamage(building, level, multipliers) * DamageToHPMultiplier;
      },
      duration: (building, level) => 2,
   },
};
export const LA2B: IBuildingDefinition = {
   ...LaserArrayBaseProps,
   pet: () => t(L.Pike),
   type: BuildingType.LA,
   damagePct: LaserArrayDamagePct * AbilityStatDamagePct,
   fireCooldown: 4,
   projectileFlag: ProjectileFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "Sm",
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IgnoreEvasion",
      flag: AbilityFlag.None,
      value: (building, level, multipliers) => 0,
      duration: (building, level) => 4,
   },
};
// export const LA2B: IBuildingDefinition = {
//    ...LaserArrayBaseProps,
//    pet: () => t(L.Pike),
//    code: CodeNumber.LA,
//    buildingFlag: BuildingFlag.CanTarget,
//    damagePct: 0.5 * LaserArrayDamagePct,
//    fireCooldown: 3.5,
//    projectileFlag: ProjectileFlag.LaserDamage,
//    damageType: DamageType.Energy,
//    element: "Pd",
//    ability: {
//       timing: AbilityTiming.OnHit,
//       range: AbilityRange.Single,
//       effect: "ReduceDamage",
//       flag: AbilityFlag.AffectedByDamageMultiplier,
//       value: (building, level, multipliers) => {
//          const def = Config.Buildings[building] as IBuildingDefinition;
//          const normVal = getDamagePerFire({ type: building, level }) * multipliers.damage;
//          return normVal * (1 - def.damagePct) * LaserArrayDamagePct;
//       },
//       duration: (building, level) => 2,
//    },
// };
