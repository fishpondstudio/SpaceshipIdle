import type { ValueOf } from "../../utils/Helper";

export const ProjectileFlag = {
   None: 0,
   NoEvasion: 1 << 0,
   LaserDamage: 1 << 1,
   DroneDamage: 1 << 2,
   TrueDamage: 1 << 3,
} as const;
export type ProjectileFlag = ValueOf<typeof ProjectileFlag>;
