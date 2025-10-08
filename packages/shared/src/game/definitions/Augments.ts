import { cast, formatNumber } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { Runtime } from "../logic/Runtime";

export interface IAugmentDefinition {
   desc: (level: number, runtime: Runtime) => string;
   onTick: (level: number, runtime: Runtime) => void;
}

export const Directives = {
   A1: cast<IAugmentDefinition>({
      desc: (level: number, runtime: Runtime) => t(L.ReduceMinWarmonger, formatNumber(level)),
      onTick: (level: number, runtime: Runtime) => {
         runtime.leftStat.warmongerMin.add(-level, t(L.Augment));
      },
   }),
} as const satisfies Record<string, IAugmentDefinition>;
