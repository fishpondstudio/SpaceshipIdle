import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { getDamagePerFire } from "../logic/BuildingLogic";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import {
   BaseWeaponProps,
   BuildingFlag,
   DamageType,
   type IDefenseProp,
   type IWeaponDefinition,
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
   damagePct: 0.75,
   damageType: DamageType.Explosive,
   projectileFlag: ProjectileFlag.DroneDamage,
   projectileSpeed: 150,
   fireCooldown: 5,
   ability: {
      timing: AbilityTiming.OnHit,
      range: AbilityRange.Single,
      effect: "TickExplosiveDamage",
      flag: AbilityFlag.AffectedByDamageMultiplier,
      value: (building, level, multipliers) => {
         const def = Config.Buildings[building] as IWeaponDefinition;
         const damage = getDamagePerFire({ type: building, level }) * multipliers.damage;
         return (damage * (1 - def.damagePct)) / 5;
      },
      duration: (building, level) => 5,
   },
   element: "Ag",
};
