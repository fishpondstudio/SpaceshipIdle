import { cast } from "../../utils/Helper";
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
      onStart: (runtime: Runtime) => {},
      onStop: (runtime: Runtime) => {},
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
      },
   }),
   B2: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointUponCompletion, 8),
      onStart: (runtime: Runtime) => {},
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 8, runtime.left.resources);
      },
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {},
   }),
} as const satisfies Record<string, IBonusDefinition>;

export type Bonus = keyof typeof Bonus;
