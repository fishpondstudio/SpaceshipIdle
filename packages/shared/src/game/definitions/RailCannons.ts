import { L, t } from "../../utils/i18n";
import { getHP } from "../logic/BuildingLogic";
import { AbilityFlag, AbilityRange, AbilityStatDamagePct, AbilityTiming, abilityChance, abilityStat } from "./Ability";
import { DamageType, type IBuildingDefinition, type IBuildingProp, ProjectileFlag } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";
import { DefaultCooldown } from "./Constant";

export const RailCannonBaseProps: IBuildingProp = {
   armor: [0, 0.5],
   shield: [0, 0.5],
   deflection: [0, 1],
   evasion: [0, 0],
   damagePct: 1,
   fireCooldown: DefaultCooldown,
   projectiles: 1,
   projectileSpeed: 350,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const RC50: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Fennec),
   code: CodeNumber.RC,
   fireCooldown: 1.5,
   element: "Li",
};

export const RC50A: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Culpeo),
   code: CodeNumber.RC,
   damagePct: AbilityStatDamagePct,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceArmor",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 2,
   },
   element: "Be",
};

export const RC50B: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Dhole),
   code: CodeNumber.RC,
   damagePct: AbilityStatDamagePct,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceShield",
      flag: AbilityFlag.None,
      value: abilityStat,
      duration: (self, level) => 2,
   },
   element: "Na",
};

export const RC100: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Corsac),
   code: CodeNumber.RC,
   damagePct: 0.75,
   fireCooldown: 1.5,
   element: "Mg",
};

export const RC100A: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Sechuran),
   code: CodeNumber.RC,
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHpOnTakingDamage2x",
      flag: AbilityFlag.None,
      value: abilityChance,
      duration: (building, level) => 1,
   },
   element: "K",
};

export const RC150: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Grayfox),
   code: CodeNumber.RC,
   fireCooldown: 1.5,
   element: "Ca",
};

export const RC150A: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Grayfox),
   code: CodeNumber.RC,
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHpOnDealingDamage10",
      flag: AbilityFlag.None,
      value: abilityChance,
      duration: (building, level) => 1,
   },
   element: "Rb",
};

export const RC150B: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Bushdog),
   code: CodeNumber.RC,
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LastStandRegen",
      flag: AbilityFlag.AffectedByHPMultiplier,
      value: (building, level, multipliers) => {
         const hp = getHP({ type: building, level }) * multipliers.hp;
         return hp * 0.5;
      },
      duration: (building, level) => 1,
   },
   element: "Sr",
};
