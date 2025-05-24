import { L, t } from "../../utils/i18n";
import { BuildingFlag, type IBuildingDefinition, ProductionDefenseProps } from "./BuildingProps";
import { CodeNumber } from "./CodeNumber";

export const D2Fab: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.D2Fab),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 2, H: 1, U: 1 },
   output: { D2: 1 },
   element: "Ne",
};
export const AntimatterFab: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.AntimatterFab),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 2, D2: 2 },
   output: { Antimatter: 1 },
   element: "Se",
};
export const RocketFab: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.RocketFab),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 1, H: 1, Ti: 1 },
   output: { Rocket: 1 },
   element: "N",
};
export const CircuitFab: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.CircuitFab),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 1, Si: 2 },
   output: { Circuit: 1 },
   element: "Cu",
};
export const XPCollector: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.XPCollector),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: {},
   output: { XP: 10 },
};
export const TiCollector: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.TiCollector),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 1 },
   output: { Ti: 1 },
   element: "Ti",
};
export const UCollector: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.UraniumCollector),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 1 },
   output: { U: 1 },
   element: "U",
};
export const HCollector: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.HCollector),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 1 },
   output: { H: 1 },
   element: "H",
};
export const SiCollector: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.SiCollector),
   code: CodeNumber.None,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Power: 1 },
   output: { Si: 1 },
   element: "Si",
};
export const UReactor: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.UraniumReactor),
   code: CodeNumber.PG,
   buildingFlag: BuildingFlag.CanRotate,
   input: { U: 1 },
   output: { Power: 10 },
   element: "Pu",
};
export const H2Reactor: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.H2Reactor),
   code: CodeNumber.PG,
   buildingFlag: BuildingFlag.CanRotate,
   input: { H: 1 },
   output: { Power: 5 },
   element: "He",
};
export const D2Reactor: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.D2Reactor),
   code: CodeNumber.PG,
   buildingFlag: BuildingFlag.CanRotate,
   input: { D2: 1 },
   output: { Power: 30 },
   element: "F",
};
export const AntimatterReactor: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.AntimatterReactor),
   code: CodeNumber.PG,
   buildingFlag: BuildingFlag.CanRotate,
   input: { Antimatter: 1 },
   output: { Power: 105 },
   element: "Br",
};
export const SolarPower: IBuildingDefinition = {
   ...ProductionDefenseProps,
   name: () => t(L.SolarPower),
   code: CodeNumber.PG,
   buildingFlag: BuildingFlag.CanRotate,
   input: {},
   output: { Power: 1 },
   element: "O",
};
