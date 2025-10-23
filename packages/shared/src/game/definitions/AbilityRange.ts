import type { ValueOf } from "../../utils/Helper";

export const AbilityRange = {
   Single: 0,
   Adjacent: 1,
   Front: 2,
   FrontTrio: 3,
   Rear: 4,
   RearTrio: 5,
   FrontAndRear: 6,
   Flanks: 7,
   Range1: 8,
   Range2: 9,
   Range3: 10,
   Row: 11,
   Column: 12,
} as const;

export type AbilityRange = ValueOf<typeof AbilityRange>;
