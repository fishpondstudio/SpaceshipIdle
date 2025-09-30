import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getDamagePerFire } from "../logic/BuildingLogic";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { DefaultCooldown } from "./Constant";
import { ProjectileFlag } from "./ProjectileFlag";

export const DroneBaseProps: IBuildingProp = {
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

export const FD1: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Eoraptor),
   code: CodeNumber.FD,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   projectileSpeed: 150,
   fireCooldown: 5,
   element: "B",
};

export const FD1A: IBuildingDefinition = {
   ...DroneBaseProps,
   pet: () => t(L.Eoraptor),
   code: CodeNumber.FD,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   projectileSpeed: 150,
   fireCooldown: 5,
   element: "Si",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Adjacent,
      effect: "TickExplosiveDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         const def = Config.Buildings[building] as IBuildingDefinition;
         const damage = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return (damage * (1 - def.damagePct)) / 5;
      },
      duration: (building, level) => 5,
   },
};
