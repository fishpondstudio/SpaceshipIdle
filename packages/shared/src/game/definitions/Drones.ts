import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getCooldownMultiplier } from "../logic/BattleLogic";
import { getNormalizedValue } from "../logic/BuildingLogic";
import { AbilityRange, AbilityTiming } from "./Ability";
import {
   type IDefenseProp,
   type IWeaponDefinition,
   BaseWeaponProps,
   BuildingFlag,
   DamageType,
   ProjectileFlag,
} from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const DroneDefenseProps: IDefenseProp = {
   armor: [0, 0.5],
   shield: [0, 1],
   deflection: [0, 0.5],
   evasion: [0, 0],
} as const;

export const FD1: IWeaponDefinition = {
   ...DroneDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.FD1),
   code: CodeNumber.FD,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, MS2B: 2 },
   output: { FD1: 1 },
   damagePct: 0.75,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   projectileSpeed: 150,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      value: (building, level) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getNormalizedValue({ type: building, level }) * getCooldownMultiplier({ type: building });
         return (damage * (1 - def.damagePct)) / 5;
      },
      duration: (building, level) => 5,
   },
   element: "Ag",
};
