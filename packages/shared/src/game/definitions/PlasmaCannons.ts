import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { DefaultCooldown } from "./Constant";
import { ProjectileFlag } from "./ProjectileFlag";

export const PlasmaCannonBaseProps: IBuildingProp = {
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

export const PC1: IBuildingDefinition = {
   ...PlasmaCannonBaseProps,
   pet: () => t(L.Potoroo),
   code: CodeNumber.PC,
   damagePct: 0.9,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LaserBlocker",
      flag: AbilityFlag.None,
      value: (self, level) => {
         return 0;
      },
      duration: (self, level) => 2,
   },
   element: "Al",
};
