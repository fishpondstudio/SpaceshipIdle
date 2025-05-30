import { AC130, AC130E, AC130S, AC30, AC30F, AC30S, AC30x3, AC76, AC76R, AC76x2 } from "./Autocannons";
import { DMG1Booster, EVA1Booster, HP1Booster, PM1Booster } from "./Boosters";
import type { IBuildingDefinition } from "./BuildingProps";
import { LA1, LA1E } from "./LaserArrays";
import { MS1, MS1F, MS1H, MS2, MS2C, MS2R, MS2S } from "./Missiles";
import {
   AntimatterFab,
   AntimatterReactor,
   CircuitFab,
   D2Fab,
   D2Reactor,
   H2Reactor,
   HCollector,
   RocketFab,
   SiCollector,
   SolarPower,
   TiCollector,
   UCollector,
   UReactor,
   XPCollector,
} from "./ProductionBuildings";
import { RC100, RC100G, RC100P, RC50, RC50E } from "./RailCannons";

export const Buildings = {
   AC30,
   AC30F,
   AC30x3,
   AC30S,
   AC76,
   AC76x2,
   AC76R,
   AC130,
   AC130E,
   AC130S,
   MS1,
   MS1H,
   MS1F,
   MS2,
   MS2R,
   MS2C,
   MS2S,
   RC50,
   RC50E,
   RC100,
   RC100G,
   RC100P,
   LA1,
   LA1E,
   D2Fab,
   AntimatterFab,
   AntimatterReactor,
   RocketFab,
   CircuitFab,
   XPCollector,
   TiCollector,
   UCollector,
   HCollector,
   SiCollector,
   UReactor,
   H2Reactor,
   D2Reactor,
   SolarPower,
   PM1Booster,
   HP1Booster,
   DMG1Booster,
   EVA1Booster,
} as const satisfies Record<string, IBuildingDefinition>;

export type Building = keyof typeof Buildings;
