import type { ValueOf } from "../../utils/Helper";

export const RuntimeFlag = {
   None: 0,
   Blackout: 1 << 0,
   BlockLaser: 1 << 1,
   KineticImmune: 1 << 2,
   ExplosiveImmune: 1 << 3,
   EnergyImmune: 1 << 4,
} as const;
export type RuntimeFlag = ValueOf<typeof RuntimeFlag>;
