import { L, t } from "../../utils/i18n";
import { AbilityFlag, AbilityRange, AbilityTiming } from "./Ability";
import { BaseWeaponProps, BuildingFlag, type IDefenseProp, type IWeaponDefinition } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const PlasmaCannonDefenseProps: IDefenseProp = {
   armor: [0, 0.5],
   shield: [0, 0.5],
   deflection: [0, 1],
   evasion: [0, 0],
} as const;

export const PC1: IWeaponDefinition = {
   ...PlasmaCannonDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.PC1),
   code: CodeNumber.PC,
   buildingFlag: BuildingFlag.CanTarget,
   damagePct: 0.9,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LaserBlocker",
      flag: AbilityFlag.None,
      value: (self, level) => {
         return 0;
      },
      duration: (self, level) => 2,
   },
   element: "Y",
};
