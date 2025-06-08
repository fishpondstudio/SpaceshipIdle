import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export const CodeNumber = {
   None: "None",
   AC: "AC",
   MS: "MS",
   RC: "RC",
   PC: "PC",
   LA: "LA",
   PG: "PG",
   BT: "BT",
} as const;

export type CodeNumber = ValueOf<typeof CodeNumber>;

export const CodeLabel: Record<CodeNumber, () => string> = {
   [CodeNumber.None]: () => t(L.Misc),
   [CodeNumber.AC]: () => t(L.AC),
   [CodeNumber.MS]: () => t(L.MS),
   [CodeNumber.RC]: () => t(L.RC),
   [CodeNumber.PC]: () => t(L.PC),
   [CodeNumber.PG]: () => t(L.PG),
   [CodeNumber.LA]: () => t(L.LA),
   [CodeNumber.BT]: () => t(L.BT),
};

Object.values(CodeNumber).forEach((l) => {
   console.assert(CodeLabel[l], `Missing ${l} in CodeLabel`);
});
