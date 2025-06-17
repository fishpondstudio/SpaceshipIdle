import type { ValueOf } from "../../utils/Helper";

export const BattleType = { Peace: 0, Practice: 1, Qualifier: 2 };
export type BattleType = ValueOf<typeof BattleType>;

export const BattleFlag = { None: 0, Silent: 1 << 0 };
export type BattleFlag = ValueOf<typeof BattleFlag>;
