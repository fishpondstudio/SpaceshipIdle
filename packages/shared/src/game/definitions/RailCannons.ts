import { clamp } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getCooldownMultiplier } from "../logic/BattleLogic";
import { getNormalizedValue, normalizedValueToHp } from "../logic/BuildingLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
import {
   BaseDefenseProps,
   BaseWeaponProps,
   BuildingFlag,
   type IDefenseProp,
   type IWeaponDefinition,
} from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const RailCannonDefenseProps: IDefenseProp = {
   armor: [0, 0.5],
   shield: [0, 0.5],
   deflection: [0, 1],
   evasion: [0, 0],
} as const;

export const RC50: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC50),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, AC30A: 1, Circuit: 1 },
   output: { RC50: 1 },
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickEnergyDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return damage * (1 - def.damagePct);
      },
      duration: (building, level) => 1,
   },
   element: "Sc",
};

export const RC100: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50: 2 },
   output: { RC100: 1 },
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "ReduceDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 1;
      },
      duration: (building, level) => 1,
   },
   element: "Ni",
};

export const RC50A: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC50A),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50: 2 },
   output: { RC50A: 1 },
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Front,
      effect: "IncreaseEvasion",
      value: (building, level) => {
         return 0.1;
      },
      duration: (building, level) => 2,
   },
   element: "Zn",
};

export const RC50B: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC50B),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50A: 2 },
   output: { RC50B: 1 },
   damagePct: 0.9,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IgnoreEvasion",
      value: (building, level) => {
         return 0;
      },
      duration: (building, level) => 1,
   },
   element: "Zr",
};

export const RC100A: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100A),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC100: 2 },
   output: { RC100A: 1 },
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHpOnTakingDamage2x",
      value: (building, level) => {
         return clamp(0.05 + (level - 1) * 0.005, 0, 0.5);
      },
      duration: (building, level) => 1,
   },
   element: "Ga",
};

export const RC100B: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100B),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC100: 2 },
   output: { RC100B: 1 },
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "RecoverHpOnDealingDamage10",
      value: (building, level) => {
         return clamp(0.05 + (level - 1) * 0.005, 0, 0.5);
      },
      duration: (building, level) => 1,
   },
   element: "Ge",
};

export const RC100C: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100C),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC100A: 1, RC100B: 1 },
   output: { RC100C: 1 },
   damagePct: 0.5,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "FailsafeRegen",
      value: (building, level) => 0,
      duration: (building, level) => 1,
   },
   element: "Tc",
};

export const RC100D: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100D),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50A: 1, RC100A: 1 },
   output: { RC100D: 1 },
   damagePct: 0.75,
   fireCooldown: 1.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LastStandRegen",
      value: (building, level) => {
         const hp = normalizedValueToHp(getNormalizedValue({ type: building, level }), building);
         return hp * 0.5;
      },
      duration: (building, level) => 1,
   },
   element: "Ru",
};
