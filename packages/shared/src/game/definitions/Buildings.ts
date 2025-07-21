import { AC130, AC130A, AC130B, AC130C, AC30, AC30A, AC30B, AC30x3, AC76, AC76A, AC76B, AC76x2 } from "./Autocannons";
import type { IBuildingDefinition } from "./BuildingProps";
import { FD1 } from "./Drones";
import { LA1, LA1A, LA1B, LA2, LA2A } from "./LaserArrays";
import { MS1, MS1A, MS1B, MS2, MS2A, MS2B, MS2C, MS2D, MS3 } from "./Missiles";
import { PC1 } from "./PlasmaCannons";
import { RC100, RC100A, RC100B, RC100C, RC100D, RC50, RC50A, RC50B } from "./RailCannons";

export const Buildings = {
   AC30,
   AC30x3,
   AC30A,
   AC30B,
   AC76,
   AC76x2,
   AC76A,
   AC76B,
   AC130,
   AC130A,
   AC130B,
   AC130C,
   RC50,
   RC50A,
   RC50B,
   RC100,
   RC100A,
   RC100B,
   RC100C,
   RC100D,
   PC1,
   MS1,
   MS1A,
   MS1B,
   MS2,
   MS2A,
   MS2B,
   MS2C,
   MS2D,
   MS3,
   FD1,
   LA1,
   LA1A,
   LA1B,
   LA2,
   LA2A,
} as const satisfies Record<string, IBuildingDefinition>;

export type Building = keyof typeof Buildings;
