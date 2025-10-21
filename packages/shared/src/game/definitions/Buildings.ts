import { AC30, AC30A, AC30B, AC30x3, AC76, AC76A, AC76x2, AC130, AC130A, AC130B } from "./Autocannons";
import type { IBuildingDefinition } from "./BuildingProps";
import { FD1, FD1A, FD1B, FD1C } from "./Drones";
import { LA1, LA1A, LA1B, LA2, LA2A, LA2B } from "./LaserArrays";
import { MS1, MS1A, MS1B, MS1C, MS2, MS2A, MS2B, MS3, MS3A, MS3B, MS4 } from "./Missiles";
import { PC1 } from "./PlasmaCannons";
import { RC50, RC50A, RC50B, RC100, RC100A, RC150, RC150A, RC150B } from "./RailCannons";

export const Buildings = {
   AC30,
   AC30x3,
   AC30A,
   AC30B,
   AC76,
   AC76x2,
   AC76A,
   AC130,
   AC130A,
   AC130B,
   RC50,
   RC50A,
   RC50B,
   RC100,
   RC100A,
   RC150,
   RC150A,
   RC150B,
   PC1,
   MS1,
   MS1A,
   MS1B,
   MS1C,
   MS2,
   MS2A,
   MS2B,
   MS3,
   MS3A,
   MS3B,
   MS4,
   FD1,
   FD1A,
   FD1B,
   FD1C,
   LA1,
   LA1A,
   LA1B,
   LA2,
   LA2A,
   LA2B,
} as const satisfies Record<string, IBuildingDefinition>;

export type Building = keyof typeof Buildings;
