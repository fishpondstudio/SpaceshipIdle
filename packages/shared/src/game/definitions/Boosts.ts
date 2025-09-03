import { cast, noop } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { addResource } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IBoostDefinition {
   desc: (runtime: Runtime) => string;
   onStart: (runtime: Runtime) => void;
   onTick: (timeLeft: number, source: string, runtime: Runtime) => void;
   onStop: (runtime: Runtime) => void;
}

export const Boosts = {
   B1: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec),
      onStart: noop,
      onStop: noop,
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
      },
   }),
   B2: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, 8),
      onStart: noop,
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 8, runtime.left.resources);
      },
      onTick: noop,
   }),
   B3: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, 3, 3),
      onStart: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
      },
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
      },
      onTick: noop,
   }),
} as const satisfies Record<string, IBoostDefinition>;

export type Boost = keyof typeof Boosts;
