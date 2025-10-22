import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export const BuildingType = {
   AC: "AC",
   MS: "MS",
   RC: "RC",
   PC: "PC",
   LA: "LA",
   FD: "FD",
} as const;

export type BuildingType = ValueOf<typeof BuildingType>;

export const BuildingTypeLabel: Record<BuildingType, () => string> = {
   [BuildingType.AC]: () => t(L.AC),
   [BuildingType.MS]: () => t(L.MS),
   [BuildingType.RC]: () => t(L.RC),
   [BuildingType.PC]: () => t(L.PC),
   [BuildingType.LA]: () => t(L.LA),
   [BuildingType.FD]: () => t(L.FD),
};
