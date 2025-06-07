import { L, t } from "../../utils/i18n";
import type { Building } from "./Buildings";

export interface ITechUpgrade {
   name: () => string;
   desc: () => string;
}

export interface ITechDefinition {
   ring: number;
   requires: Tech[];
   unlockBuildings?: Building[];
   unlockUpgrades?: ITechUpgrade[];
   multiplier?: Partial<Record<Building, number>>;
   name?: () => string;
}

export class TechDefinitions {
   ////////// R0 //////////
   A1: ITechDefinition = {
      name: () => t(L.TechSkiff),
      ring: 0,
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };

   ////////// R1 //////////
   B1: ITechDefinition = {
      name: () => t(L.TechHydrogen),
      ring: 1,
      requires: ["A1"],
      unlockBuildings: ["HCollector"],
   };
   B2: ITechDefinition = {
      name: () => t(L.TechTitanium),
      ring: 1,
      requires: ["A1"],
      unlockBuildings: ["TiCollector"],
   };
   B3: ITechDefinition = {
      name: () => t(L.TechSilicon),
      ring: 1,
      requires: ["A1"],
      unlockBuildings: ["SiCollector"],
   };
   B4: ITechDefinition = {
      name: () => t(L.TechPhotovoltaics),
      ring: 1,
      requires: ["A1"],
      unlockBuildings: ["SolarPower"],
   };
   ////////// R2 //////////
   C1: ITechDefinition = {
      name: () => t(L.TechThermalPower),
      ring: 2,
      requires: ["B1"],
      unlockBuildings: ["H2Reactor"],
      multiplier: { HCollector: 1 },
   };
   C2: ITechDefinition = {
      name: () => t(L.TechRocketry),
      ring: 2,
      requires: ["B1", "B2"],
      unlockBuildings: ["RocketFab"],
      multiplier: { HCollector: 1, TiCollector: 1 },
   };
   C3: ITechDefinition = {
      name: () => t(L.TechLightArtillery),
      ring: 2,
      requires: ["B3", "B2"],
      unlockBuildings: ["AC30"],
      multiplier: { SiCollector: 1, TiCollector: 1 },
   };
   C4: ITechDefinition = {
      name: () => t(L.TechSemiconductor),
      ring: 2,
      requires: ["B3"],
      unlockBuildings: ["CircuitFab"],
      multiplier: { SiCollector: 1 },
   };
   C5: ITechDefinition = {
      name: () => t(L.TechScout),
      ring: 2,
      requires: ["B3", "B4"],
      unlockUpgrades: [{ name: () => t(L.Size8x8), desc: () => t(L.Size8x8Desc) }],
   };
   C6: ITechDefinition = {
      name: () => t(L.TechRadiation),
      ring: 2,
      requires: ["B4", "B1"],
      unlockBuildings: ["UCollector"],
      multiplier: { SolarPower: 1 },
   };

   ////////// R3 //////////
   D1: ITechDefinition = {
      name: () => t(L.TechSystemRecovery),
      ring: 3,
      requires: ["D2"],
      unlockBuildings: ["MS1H"],
      multiplier: { MS1: 1 },
   };
   D2: ITechDefinition = {
      name: () => t(L.TechMissile),
      ring: 3,
      requires: ["C2"],
      unlockBuildings: ["MS1"],
      multiplier: { RocketFab: 1 },
   };
   D3: ITechDefinition = {
      name: () => t(L.TechMediumArtillery),
      ring: 3,
      requires: ["C3"],
      unlockBuildings: ["AC76"],
      multiplier: { AC30: 1 },
   };
   D4: ITechDefinition = {
      name: () => t(L.TechRapidFire),
      ring: 3,
      requires: ["C3"],
      unlockBuildings: ["AC30x3"],
      multiplier: { AC30: 1 },
   };
   D5: ITechDefinition = {
      name: () => t(L.TechFortifiedArtillery),
      ring: 3,
      requires: ["D4", "C4"],
      unlockBuildings: ["AC30F"],
      multiplier: { AC30x3: 1, CircuitFab: 1 },
   };
   D6: ITechDefinition = {
      name: () => t(L.TechCorvette),
      ring: 3,
      requires: ["C5", "C4"],
      unlockUpgrades: [{ name: () => t(L.Size10x10), desc: () => t(L.Size10x10Desc) }],
   };
   D7: ITechDefinition = {
      name: () => t(L.TechDeuterium),
      ring: 3,
      requires: ["C6"],
      unlockBuildings: ["D2Fab"],
      multiplier: { UCollector: 1, HCollector: 1 },
   };
   D8: ITechDefinition = {
      name: () => t(L.TechNuclearFission),
      ring: 3,
      requires: ["C6", "C1"],
      unlockBuildings: ["UReactor"],
      multiplier: { UCollector: 1 },
   };

   ////////// R4 //////////
   E1: ITechDefinition = {
      ring: 4,
      requires: ["D1"],
      name: () => t(L.TechReinforcedDefense),
      unlockBuildings: ["MS1F"],
      multiplier: { MS1H: 1 },
   };
   E2: ITechDefinition = {
      ring: 4,
      requires: ["D2"],
      name: () => t(L.CriticalStrike),
      unlockBuildings: ["MS2", "DMG1Booster"],
      multiplier: { MS1: 1 },
   };
   E3: ITechDefinition = {
      ring: 4,
      requires: ["D2", "D3"],
      name: () => t(L.TechRocketArtillery),
      unlockBuildings: ["AC76R"],
      multiplier: { AC76: 1, RocketFab: 1 },
   };
   E4: ITechDefinition = {
      ring: 4,
      requires: ["D4"],
      name: () => t(L.TechShieldedArtillery),
      unlockBuildings: ["AC30S"],
      multiplier: { AC30x3: 1 },
   };
   E5: ITechDefinition = {
      name: () => t(L.TechHeavyArtillery),
      ring: 4,
      requires: ["D4"],
      unlockBuildings: ["AC130", "HP1Booster"],
      multiplier: { AC30x3: 1 },
   };
   E6: ITechDefinition = {
      ring: 4,
      requires: ["D5"],
      name: () => t(L.TechRailCannon),
      unlockBuildings: ["RC50"],
      multiplier: { AC30F: 1, CircuitFab: 1 },
   };
   E7: ITechDefinition = {
      ring: 4,
      requires: ["E6"],
      name: () => t(L.TechOffenseDisruptor),
      unlockBuildings: ["RC100", "PM1Booster"],
      multiplier: { RC50: 1 },
   };
   E8: ITechDefinition = {
      name: () => t(L.TechFrigate),
      ring: 4,
      requires: ["D6"],
      unlockUpgrades: [{ name: () => t(L.Size12x12), desc: () => t(L.Size12x12Desc) }],
   };
   E9: ITechDefinition = {
      name: () => t(L.TechNuclearFusion),
      ring: 4,
      requires: ["D8", "D7"],
      unlockBuildings: ["D2Reactor"],
      multiplier: { D2Fab: 1 },
   };
   E10: ITechDefinition = {
      ring: 4,
      name: () => t(L.TechLaserArray),
      requires: ["D8", "D1"],
      unlockBuildings: ["LA1", "EVA1Booster"],
      multiplier: { UCollector: 1, MS1H: 1 },
   };

   ////////// R5 //////////
   F1: ITechDefinition = {
      ring: 5,
      name: () => t(L.TechEchoShield),
      unlockBuildings: ["MS2S"],
      requires: ["E1", "F2"],
      multiplier: { MS2C: 1, MS1F: 1 },
   };
   F2: ITechDefinition = {
      ring: 5,
      requires: ["E2"],
      name: () => t(L.TechDamageControl),
      unlockBuildings: ["MS2C"],
      multiplier: { MS2: 1 },
   };
   F3: ITechDefinition = {
      name: () => t(L.TechDamageReclaim),
      ring: 5,
      requires: ["E2", "E3"],
      unlockBuildings: ["MS2R"],
      multiplier: { MS2: 1, AC76R: 1 },
   };
   F4: ITechDefinition = {
      ring: 5,
      requires: ["E3"],
      name: () => t(L.TechArmorPiercing),
      unlockBuildings: ["AC76x2"],
      multiplier: { AC76R: 1 },
   };
   F5: ITechDefinition = {
      ring: 5,
      name: () => t(L.TechDefenseBreaker),
      requires: ["E5"],
      unlockBuildings: ["AC130S"],
      multiplier: { AC130: 1 },
   };
   F6: ITechDefinition = {
      name: () => t(L.TechHeavyExplosives),
      ring: 5,
      requires: ["E5"],
      unlockBuildings: ["AC130E"],
      multiplier: { AC130: 1 },
   };
   F7: ITechDefinition = {
      ring: 5,
      requires: ["E6"],
      name: () => t(L.TechEvasionMatrix),
      unlockBuildings: ["RC50E"],
      multiplier: { RC50: 1 },
   };
   F8: ITechDefinition = {
      ring: 5,
      requires: ["E7"],
      name: () => t(L.TechReactiveRegen),
      unlockBuildings: ["RC100G"],
      multiplier: { RC100: 1 },
   };
   F9: ITechDefinition = {
      ring: 5,
      requires: ["E7"],
      name: () => t(L.TechProactiveRegen),
      unlockBuildings: ["RC100P"],
      multiplier: { RC100: 1 },
   };
   F10: ITechDefinition = {
      name: () => t(L.TechDestroyer),
      ring: 5,
      requires: ["E8"],
      unlockUpgrades: [{ name: () => t(L.Size14x14), desc: () => t(L.Size14x14Desc) }],
   };
   F11: ITechDefinition = {
      ring: 5,
      requires: ["E9"],
      name: () => t(L.TechAntimatter),
      unlockBuildings: ["AntimatterFab"],
      multiplier: { D2Fab: 1 },
   };
   F12: ITechDefinition = {
      ring: 5,
      requires: ["E10"],
      name: () => t(L.TechLaserExplosive),
      unlockBuildings: ["LA1E"],
      multiplier: { LA1: 1 },
   };

   ////////// R6 //////////
   G1: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G2: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G3: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G4: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G5: ITechDefinition = {
      ring: 6,
      name: () => t(L.TechBuffDispel),
      requires: ["E4", "F4"],
      unlockBuildings: ["AC76D"],
      multiplier: { AC30S: 1, AC76x2: 1 },
   };
   G6: ITechDefinition = {
      ring: 6,
      name: () => t(L.TechDefenseCluster),
      requires: ["F5"],
      unlockBuildings: ["AC130C"],
      multiplier: { AC130S: 1, AC130E: 1 },
   };
   G7: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G8: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G9: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G10: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G11: ITechDefinition = {
      name: () => t(L.TechCruiser),
      ring: 6,
      requires: ["F10"],
      unlockUpgrades: [{ name: () => t(L.Size16x16), desc: () => t(L.Size16x16Desc) }],
   };
   G12: ITechDefinition = {
      ring: 6,
      requires: ["F11"],
      name: () => t(L.TechMatterCollision),
      unlockBuildings: ["AntimatterReactor"],
      multiplier: { AntimatterFab: 1 },
   };
   G13: ITechDefinition = {
      ring: 6,
      requires: [],
   };
   G14: ITechDefinition = {
      ring: 6,
      requires: [],
   };

   ////////// R7 //////////
   H1: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H2: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H3: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H4: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H5: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H6: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H7: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H8: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H9: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H10: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H11: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H12: ITechDefinition = {
      name: () => t(L.TechBattlecruiser),
      ring: 7,
      requires: ["G11"],
      unlockUpgrades: [{ name: () => t(L.Size18x18), desc: () => t(L.Size18x18Desc) }],
   };
   H13: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H14: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H15: ITechDefinition = {
      ring: 7,
      requires: [],
   };
   H16: ITechDefinition = {
      ring: 7,
      requires: [],
   };

   ////////// R8 //////////
   I1: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I2: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I3: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I4: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I5: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I6: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I7: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I8: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I9: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I10: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I11: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I12: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I13: ITechDefinition = {
      name: () => t(L.TechDreadnought),
      ring: 8,
      requires: ["H12"],
      unlockUpgrades: [{ name: () => t(L.Size20x20), desc: () => t(L.Size20x20Desc) }],
   };
   I14: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I15: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I16: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I17: ITechDefinition = {
      ring: 8,
      requires: [],
   };
   I18: ITechDefinition = {
      ring: 8,
      requires: [],
   };

   ////////// R9 //////////
   J1: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J2: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J3: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J4: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J5: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J6: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J7: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J8: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J9: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J10: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J11: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J12: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J13: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J14: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J15: ITechDefinition = {
      name: () => t(L.TechCarrier),
      ring: 9,
      requires: ["I13"],
      unlockUpgrades: [{ name: () => t(L.Size22x22), desc: () => t(L.Size22x22Desc) }],
   };
   J16: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J17: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J18: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J19: ITechDefinition = {
      ring: 9,
      requires: [],
   };
   J20: ITechDefinition = {
      ring: 9,
      requires: [],
   };
}

export type Tech = keyof TechDefinitions;
