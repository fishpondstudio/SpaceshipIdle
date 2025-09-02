import { cast, noop } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { addResource } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IBonusDefinition {
   desc: (runtime: Runtime) => string;
   onStart: (runtime: Runtime) => void;
   onStop: (runtime: Runtime) => void;
   onTick: (timeLeft: number, source: string, runtime: Runtime) => void;
}

export const Bonus = {
   B1: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec),
      onStart: noop,
      onStop: noop,
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
      },
   }),
   B2: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, 8),
      onStart: noop,
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 8, runtime.left.resources);
      },
      onTick: noop,
   }),
   B3: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, 3, 3),
      onStart: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
      },
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
      },
      onTick: noop,
   }),
} as const satisfies Record<string, IBonusDefinition>;

export type Bonus = keyof typeof Bonus;
