import type { ValueOf } from "@spaceship-idle/shared/src/utils/Helper";

export const PrestigeReason = {
   None: 0,
   Incompatible: 2,
};
export type PrestigeReason = ValueOf<typeof PrestigeReason>;
