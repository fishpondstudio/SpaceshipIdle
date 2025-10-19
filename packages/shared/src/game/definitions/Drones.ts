import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityRange, AbilityTiming, abilityDamage } from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
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
   code: CodeNumber.FD,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   element: "B",
};

export const FD1A: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Eoraptor),
   code: CodeNumber.FD,
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
