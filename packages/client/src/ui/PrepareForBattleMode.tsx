import type { ValueOf } from "@spaceship-idle/shared/src/utils/Helper";

export const PrepareForBattleMode = {
   Normal: 0,
   Prompt: 1,
};
export type PrepareForBattleMode = ValueOf<typeof PrepareForBattleMode>;
