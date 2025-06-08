import { L, t } from "../../utils/i18n";
import { AbilityRange, AbilityTiming } from "./Ability";
import { type IWeaponDefinition, BaseDefenseProps, BaseWeaponProps, BuildingFlag } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const PC1: IWeaponDefinition = {
   ...BaseDefenseProps,
   ...BaseWeaponProps,
   name: () => t(L.PC1),
   code: CodeNumber.PC,
   buildingFlag: BuildingFlag.CanTarget,
   input: { Power: 2, AC130E: 1, RC50E: 1 },
   output: { PC1: 1 },
   damagePct: 0.9,
   ability: {
      timing: AbilityTiming.OnFire,
      range: AbilityRange.Single,
      effect: "LaserBlocker",
      value: (self, level) => {
         return 0;
      },
      duration: (self, level) => 2,
   },
   element: "Y",
};
