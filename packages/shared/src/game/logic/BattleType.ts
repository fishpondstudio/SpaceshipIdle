import type { ValueOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export const BattleType = { Peace: 0, Practice: 1, Qualifier: 2 };
export type BattleType = ValueOf<typeof BattleType>;

export const BattleFlag = { None: 0, Silent: 1 << 0 };
export type BattleFlag = ValueOf<typeof BattleFlag>;

export const BattleVictoryType = ["Overwhelming", "Decisive", "Minor", "Narrow"] as const;
export type BattleVictoryType = (typeof BattleVictoryType)[number];

export const BattleVictoryTypeLabel: Record<BattleVictoryType, () => string> = {
   Overwhelming: () => t(L.OverwhelmingVictory),
   Decisive: () => t(L.DecisiveVictory),
   Minor: () => t(L.MinorVictory),
   Narrow: () => t(L.NarrowVictory),
};
