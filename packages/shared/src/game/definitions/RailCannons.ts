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
   input: { Power: 2, AC30F: 1, Circuit: 1 },
   output: { RC50: 1 },
   damagePct: 0.75,
   fireCooldown: 1,
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
   fireCooldown: 1,
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

export const RC50E: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC50E),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50: 2 },
   output: { RC50E: 1 },
   damagePct: 0.75,
   fireCooldown: 1,
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

export const RC50P: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC50P),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50E: 2 },
   output: { RC50P: 1 },
   damagePct: 0.9,
   fireCooldown: 1,
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

export const RC100G: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100G),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC100: 2 },
   output: { RC100G: 1 },
   damagePct: 0.75,
   fireCooldown: 1,
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

export const RC100P: IWeaponDefinition = {
   ...RailCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100P),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC100: 2 },
   output: { RC100P: 1 },
   damagePct: 0.75,
   fireCooldown: 1,
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

export const RC100F: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100F),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC100P: 1, RC100G: 1 },
   output: { RC100F: 1 },
   damagePct: 0.5,
   fireCooldown: 1,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "FailsafeRegen",
      value: (building, level) => 0,
      duration: (building, level) => 1,
   },
   element: "Tc",
};

export const RC100L: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.RC100L),
   code: CodeNumber.RC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, RC50E: 1, RC100G: 1 },
   output: { RC100L: 1 },
   damagePct: 0.75,
   fireCooldown: 1,
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
