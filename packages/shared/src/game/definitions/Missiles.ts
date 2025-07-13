import { clamp } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getCooldownMultiplier } from "../logic/BattleLogic";
import { getNormalizedValue, normalizedValueToHp } from "../logic/BuildingLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
import { BaseWeaponProps, BuildingFlag, DamageType, type IDefenseProp, type IWeaponDefinition } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const MissileDefenseProps: IDefenseProp = {
   armor: [0, 1],
   shield: [0, 0.5],
   deflection: [0, 0.5],
   evasion: [0, 0],
} as const;

export const MS1: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS1),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Adjacent,
      effect: "TickEnergyDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 5 / 3;
      },
      duration: (building, level) => 5,
   },
   element: "Na",
};
export const MS1A: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS1A),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.5,
   damageType: DamageType.Explosive,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Adjacent,
      effect: "RecoverHp",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 3;
      },
      duration: (building, level) => 1,
   },
   element: "S",
};

export const MS1B: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS1B),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   damageType: DamageType.Explosive,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Adjacent,
      effect: "IncreaseMaxHp",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (normalizedValueToHp(damage, building) * (1 - def.damagePct)) / 3;
      },
      duration: (building, level) => 5,
   },
   element: "Ca",
};
export const MS2: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS2),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.9,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "CriticalDamage2",
      value: (building, level) => 0.2,
      duration: (building, level) => 5,
   },
   element: "Ar",
};
export const MS2A: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS2A),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.9,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LifeSteal",
      value: (building, level) => 0.25,
      duration: (building, level) => 4,
   },
   element: "K",
};
export const MS2B: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS2B),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.8,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "DamageControl",
      value: (building, level) => 0.01,
      duration: (building, level) => 4,
   },
   element: "Fe",
};
export const MS2C: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS2C),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "ReflectDamage",
      value: (building, level) => {
         return clamp(0.05 + (level - 1) * 0.005, 0, 0.5);
      },
      duration: (building, level) => 5,
   },
   element: "Co",
};
export const MS3: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS3),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.9,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.RearTrio,
      effect: "ProductionDisruption",
      value: (building, level) => {
         return 0;
      },
      duration: (building, level) => 2,
   },
   element: "Sr",
};

export const MS2D: IWeaponDefinition = {
   ...MissileDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.MS2D),
   code: CodeNumber.MS,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.75,
   damageType: DamageType.Explosive,
   fireCooldown: 4.5,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Adjacent,
      effect: "DispelDebuff",
      value: (building, level) => 0,
      duration: (building, level) => 0,
   },
   element: "Nb",
};
