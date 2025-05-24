import type { ValueOf } from "../../utils/Helper";

export const Side = {
   Left: 0,
   Right: 1,
} as const;

export type Side = ValueOf<typeof Side>;
