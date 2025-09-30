import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityRange, AbilityStatDamagePct, AbilityTiming, abilityStat } from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
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
   code: CodeNumber.AC,
   element: "C",
};
export const AC30A: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Margay),
   code: CodeNumber.AC,
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
   code: CodeNumber.AC,
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
   code: CodeNumber.AC,
   projectiles: 3,
   element: "F",
};
export const AC76: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Caracal),
   code: CodeNumber.AC,
   element: "P",
};
export const AC76x2: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Ocelot),
   code: CodeNumber.AC,
   element: "S",
   projectiles: 2,
};
export const AC76A: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Caracal),
   code: CodeNumber.AC,
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
   code: CodeNumber.AC,
   element: "Se",
};
export const AC130A: IBuildingDefinition = {
   ...AutocannonBaseProps,
   pet: () => t(L.Leopard),
   code: CodeNumber.AC,
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
   code: CodeNumber.AC,
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
