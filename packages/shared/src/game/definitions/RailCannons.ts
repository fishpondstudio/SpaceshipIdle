import { clamp } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { getHP } from "../logic/BuildingLogic";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import {
   BuildingFlag,
   DamageType,
   type IBuildingDefinition,
   type IBuildingProp,
   ProjectileFlag,
} from "./BuildingProps";
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
   projectileSpeed: 300,
   damageType: DamageType.Kinetic,
   projectileFlag: ProjectileFlag.None,
} as const;

export const RC50: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Fennec),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   fireCooldown: 1,
   element: "Sc",
};

export const RC50A: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Culpeo),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Front,
      effect: "IncreaseEvasion",
      flag: AbilityFlag.None,
      value: (building, level) => {
         return 0.1;
      },
      duration: (building, level) => 2,
   },
   element: "Zn",
};

export const RC50B: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Dhole),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.9,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IgnoreEvasion",
      flag: AbilityFlag.None,
      value: (building, level) => {
         return 0;
      },
      duration: (building, level) => 1,
   },
   element: "Zr",
};

export const RC100: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Corsac),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   fireCooldown: 1.5,
   // ability: {
   //    timing: AbilityTiming.OnHit,
   //    range: AbilityRange.Single,
   //    effect: "ReduceDamage",
   //    flag: AbilityFlag.AffectedByDamageMultiplier,
   //    value: (building, level, multipliers) => {
   //       const def = Config.Buildings[building] as IBuildingDefinition;
   //       const damage = getDamagePerFire({ type: building, level }) * multipliers.damage;
   //       return (damage * (1 - def.damagePct)) / 1;
   //    },
   //    duration: (building, level) => 1,
   // },
   element: "Ni",
};

export const RC100A: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Sechuran),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHpOnTakingDamage2x",
      flag: AbilityFlag.None,
      value: (building, level) => {
         return clamp(0.05 + (level - 1) * 0.005, 0, 0.5);
      },
      duration: (building, level) => 1,
   },
   element: "Ga",
};

export const RC150: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Grayfox),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   fireCooldown: 1.5,
   element: "Ge",
};

export const RC150A: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Grayfox),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHpOnDealingDamage10",
      flag: AbilityFlag.None,
      value: (building, level) => {
         return clamp(0.05 + (level - 1) * 0.005, 0, 0.5);
      },
      duration: (building, level) => 1,
   },
   element: "Ge",
};

export const RC100C: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Redfox),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.5,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "FailsafeRegen",
      flag: AbilityFlag.None,
      value: (building, level) => 0,
      duration: (building, level) => 1,
   },
   element: "Tc",
};

export const RC100D: IBuildingDefinition = {
   ...RailCannonBaseProps,
   pet: () => t(L.Bushdog),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
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
   element: "Ru",
};
