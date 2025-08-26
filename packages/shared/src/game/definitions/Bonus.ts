import { cast } from "../../utils/Helper";
import type { Runtime } from "../logic/Runtime";

export interface IBonusDefinition {
   desc: () => string;
   onStart: (runtime: Runtime) => void;
   onStop: (runtime: Runtime) => void;
   onTick: (runtime: Runtime) => void;
}

export const Bonus = {
   B1: cast<IBonusDefinition>({
      desc: () => "Bonus 1",
      onStart: (runtime: Runtime) => {},
      onStop: (runtime: Runtime) => {},
      onTick: (runtime: Runtime) => {},
   }),
} as const satisfies Record<string, IBonusDefinition>;
