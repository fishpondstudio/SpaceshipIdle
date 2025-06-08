import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getCooldownMultiplier } from "../logic/BattleLogic";
import { getNormalizedValue } from "../logic/BuildingLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
import { BaseDefenseProps, BaseWeaponProps, BuildingFlag, type IWeaponDefinition } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const AC30: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, Ti: 1, Si: 1 },
   output: { AC30: 1 },
   element: "Li",
};
export const AC30F: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30F),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30x3: 2 },
   output: { AC30F: 1 },
   element: "Mg",
   damagePct: 0.8,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Adjacent,
      effect: "IncreaseArmor",
      value: (self, level) => {
         return level / 2;
      },
      duration: (self, level) => 3,
   },
};
export const AC30S: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30S),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30x3: 2 },
   output: { AC30S: 1 },
   element: "Cr",
   damagePct: 0.8,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Adjacent,
      effect: "IncreaseShield",
      value: (self, level) => {
         return level / 2;
      },
      duration: (self, level) => 3,
   },
};
export const AC30x3: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30x3),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 3, AC30: 3 },
   output: { AC30x3: 1 },
   projectiles: 3,
   element: "Be",
};
export const AC76: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30: 2 },
   output: { AC76: 1 },
   element: "B",
};
export const AC76x2: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76x2),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC76R: 2 },
   output: { AC76x2: 1 },
   element: "Al",
   projectiles: 2,
   damagePct: 0.8,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.RearTrio,
      effect: "ReduceArmor",
      value: (self, level) => {
         return level / 2;
      },
      duration: (self, level) => 2,
   },
};
export const AC76R: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76R),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, AC76: 2, Rocket: 2 },
   output: { AC76R: 1 },
   element: "Cl",
   damagePct: 0.5,
   fireCooldown: 2.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Adjacent,
      effect: "TickKineticDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 2;
      },
      duration: (building, level) => 1,
   },
};
export const AC76D: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76D),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, AC76x2: 2, AC30S: 2 },
   output: { AC76D: 1 },
   element: "Kr",
   damagePct: 0.8,
   fireCooldown: 2,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.RearTrio,
      effect: "DispelBuff",
      value: (building, level) => 0,
      duration: (building, level) => 0,
   },
};
export const AC130: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30x3: 2 },
   output: { AC130: 1 },
   element: "C",
};
export const AC130E: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130E),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC130: 2 },
   output: { AC130E: 1 },
   damagePct: 0.75,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 2.5;
      },
      duration: (building, level) => 5,
   },
   element: "P",
};
export const AC130S: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130S),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC130: 2 },
   output: { AC130S: 1 },
   damagePct: 0.8,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Adjacent,
      effect: "ReduceArmorAndShield",
      value: (self, level) => {
         return level / 4;
      },
      duration: (self, level) => 2,
   },
   element: "Mn",
};
export const AC130C: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130C),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC130S: 1, AC130E: 1 },
   output: { AC130C: 1 },
   damagePct: 0.9,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "IncreaseMaxHpAutoCannonCluster",
      value: (self, level) => {
         return 0.1;
      },
      duration: (self, level) => 2,
   },
   element: "Rb",
};
