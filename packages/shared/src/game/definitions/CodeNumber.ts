import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export const CodeNumber = {
   None: "None",
   AC: "AC",
   MS: "MS",
   RC: "RC",
   PC: "PC",
   LA: "LA",
   FD: "FD",
   BT: "BT",
} as const;

export type CodeNumber = ValueOf<typeof CodeNumber>;

export const CodeLabel: Record<CodeNumber, () => string> = {
   [CodeNumber.None]: () => t(L.Misc),
   [CodeNumber.AC]: () => t(L.AC),
   [CodeNumber.MS]: () => t(L.MS),
   [CodeNumber.RC]: () => t(L.RC),
   [CodeNumber.PC]: () => t(L.PC),
   [CodeNumber.LA]: () => t(L.LA),
   [CodeNumber.FD]: () => t(L.FD),
   [CodeNumber.BT]: () => t(L.BT),
};
