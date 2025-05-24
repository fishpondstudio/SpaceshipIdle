import type { ValueOf } from "../../utils/Helper";

export const BattleStatus = { InProgress: 0, LeftWin: 1, RightWin: 2, Draw: 3 };
export type BattleStatus = ValueOf<typeof BattleStatus>;
