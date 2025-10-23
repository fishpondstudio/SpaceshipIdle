import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityStatDamagePct, AbilityTiming, abilityStat } from "./Ability";
import { AbilityRange } from "./AbilityRange";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { BuildingType } from "./BuildingType";
import { DefaultCooldown } from "./Constant";
import { ProjectileFlag } from "./ProjectileFlag";

export const AutocannonBaseProps: IBuildingProp = {
   armor: [0, 0.5],
   shield: [0, 0.5],
   deflection: [0, 1],
   evasion: [0, 0],
   damagePct: 1,
   fireCooldown: DefaultCooldown,
   projectiles: 1,
   projectileSpeed: 300,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const AC30: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Kodkod),
   type: BuildingType.AC,
   element: "C",
};
export const AC30A: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Margay),
   type: BuildingType.AC,
   element: "N",
   damagePct: AbilityStatDamagePct,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IncreaseArmor",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 3,
   },
};
export const AC30B: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Oncilla),
   type: BuildingType.AC,
   element: "O",
   damagePct: AbilityStatDamagePct,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IncreaseShield",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 3,
   },
};
export const AC30x3: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Serval),
   type: BuildingType.AC,
   projectiles: 3,
   element: "F",
};
export const AC76: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Caracal),
   type: BuildingType.AC,
   element: "P",
};
export const AC76x2: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Ocelot),
   type: BuildingType.AC,
   element: "S",
   projectiles: 2,
};
export const AC76A: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Caracal),
   type: BuildingType.AC,
   element: "Cl",
   damagePct: AbilityStatDamagePct,
   fireCooldown: 2.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceDeflection",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 2,
   },
};
export const AC130: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Bobcat),
   type: BuildingType.AC,
   element: "Se",
};
export const AC130A: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Leopard),
   type: BuildingType.AC,
   damagePct: AbilityStatDamagePct,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Rear,
      effect: "ReduceArmorAndShield",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 2,
   },
   element: "Br",
};
export const AC130B: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Jaguar),
   type: BuildingType.AC,
   damagePct: AbilityStatDamagePct,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IncreaseMaxHpAutoCannonCluster",
      flag: AbilityFlag.None,
      value: (self, level) => {
         return 0.1;
      },
      duration: (self, level) => 2,
   },
   element: "I",
};
