import type { ValueOf } from "../../utils/Helper";

export const BattleType = { Peace: 0, Practice: 1, Qualifier: 2, Simulated: 3 };
export type BattleType = ValueOf<typeof BattleType>;
