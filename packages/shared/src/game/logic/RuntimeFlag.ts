import type { ValueOf } from "../../utils/Helper";

export const RuntimeFlag = {
   None: 0,
   NoFire: 1 << 0,
   BlockLaser: 1 << 1,
} as const;
export type RuntimeFlag = ValueOf<typeof RuntimeFlag>;
