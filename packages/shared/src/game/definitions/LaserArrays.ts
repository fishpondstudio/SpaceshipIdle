import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { cooldownMultiplier, normalizedValue } from "../logic/BattleLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
import {
   type IWeaponDefinition,
   BaseDefenseProps,
   BaseWeaponProps,
   BuildingFlag,
   DamageType,
   WeaponFlag,
} from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const LA1: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 4, U: 2, MS1H: 2 },
   output: { LA1: 1 },
   damagePct: 0.5,
   weaponFlag: WeaponFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "V",
};
export const LA1E: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.LA1E),
   code: CodeNumber.LA,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 4, LA1: 2 },
   output: { LA1E: 1 },
   damagePct: 0.1,
   weaponFlag: WeaponFlag.LaserDamage,
   damageType: DamageType.Energy,
   element: "As",
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = normalizedValue({ type: building, level }) * cooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 3;
      },
      duration: (building, level) => 2,
   },
};
