import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityTiming, abilityDamage } from "./Ability";
import { AbilityRange } from "./AbilityRange";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { BuildingType } from "./BuildingType";
import { ProjectileFlag } from "./ProjectileFlag";

export const DroneBaseProps: IBuildingProp = {
   armor: [0, 0.5],
   shield: [0, 1],
   deflection: [0, 0.5],
   evasion: [0, 0],
   damagePct: 1,
   fireCooldown: 5,
   projectiles: 1,
   projectileSpeed: 150,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const FD1: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Eoraptor),
   type: BuildingType.FD,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   element: "B",
};

export const FD1A: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Eoraptor),
   type: BuildingType.FD,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   element: "Si",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Adjacent,
      effect: "TickExplosiveDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: abilityDamage,
      duration: (building, level) => 5,
   },
};
export const FD1B: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Parvicursor),
   type: BuildingType.FD,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   element: "Ge",
   fireCooldown: 4,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "Blackout",
      flag: AbilityFlag.None,
      value: (building, level) => {
         return 0;
      },
      duration: (building, level) => 2,
   },
};

export const FD1C: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Parvicursor),
   type: BuildingType.FD,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   element: "As",
   fireCooldown: 4,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.RearTrio,
      effect: "NullifyBuff",
      flag: AbilityFlag.None,
      value: (building, level) => 0,
      duration: (building, level) => 1,
   },
};
