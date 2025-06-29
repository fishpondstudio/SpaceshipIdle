import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getCooldownMultiplier } from "../logic/BattleLogic";
import { getNormalizedValue } from "../logic/BuildingLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
import { BaseWeaponProps, BuildingFlag, type IDefenseProp, type IWeaponDefinition } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const AutocannonDefenseProps: IDefenseProp = {
   armor: [0, 0.5],
   shield: [0, 0.5],
   deflection: [0, 1],
   evasion: [0, 0],
} as const;

export const AC30: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, Ti: 1, Si: 1 },
   output: { AC30: 1 },
   element: "Li",
};
export const AC30A: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30A),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30x3: 2 },
   output: { AC30A: 1 },
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
export const AC30B: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC30B),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30x3: 2 },
   output: { AC30B: 1 },
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
   ...AutocannonDefenseProps,
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
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30: 2 },
   output: { AC76: 1 },
   element: "B",
};
export const AC76x2: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76x2),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC76A: 2 },
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
export const AC76A: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76A),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, AC76: 2, Rocket: 2 },
   output: { AC76A: 1 },
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
export const AC76B: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC76B),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, AC76x2: 2, AC30B: 2 },
   output: { AC76B: 1 },
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
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC30x3: 2 },
   output: { AC130: 1 },
   element: "C",
};
export const AC130A: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130A),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC130: 2 },
   output: { AC130A: 1 },
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
export const AC130B: IWeaponDefinition = {
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130B),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC130: 2 },
   output: { AC130B: 1 },
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
   ...AutocannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.AC130C),
   code: CodeNumber.AC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 1, AC130A: 1, AC130B: 1 },
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
