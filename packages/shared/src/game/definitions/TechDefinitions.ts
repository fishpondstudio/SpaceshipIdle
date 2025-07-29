import { L, t } from "../../utils/i18n";
import type { IHaveXY } from "../../utils/Vector2";
import type { Multipliers } from "../logic/IMultiplier";
import type { Building } from "./Buildings";

export interface ITechUpgrade {
   name: () => string;
   desc: () => string;
}

export interface ITechDefinition {
   position: IHaveXY;
   requires: Tech[];
   unlockBuildings?: Building[];
   unlockUpgrades?: ITechUpgrade[];
   multiplier?: Partial<Record<Building, Multipliers>>;
   name?: () => string;
}

export interface IShipClassDefinition {
   name: () => string;
   range: [number, number];
   index: number;
}

export const ShipClass = {
   Skiff: {
      name: () => t(L.TechSkiff),
      range: [0, 2],
      index: 0,
   } as IShipClassDefinition,
   Scout: {
      name: () => t(L.TechScout),
      range: [3, 5],
      index: 1,
   } as IShipClassDefinition,
   Corvette: {
      name: () => t(L.TechCorvette),
      range: [6, 8],
      index: 2,
   } as IShipClassDefinition,
} as const satisfies Record<string, IShipClassDefinition>;

export type ShipClass = keyof typeof ShipClass;

export class TechDefinitions {
   A1: ITechDefinition = {
      position: { x: 0, y: 0 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockBuildings: ["AC30"],
   };
   A2: ITechDefinition = {
      position: { x: 0, y: 1 },
      name: () => t(L.TechMissile),
      requires: [],
      unlockBuildings: ["MS1"],
   };
   A3: ITechDefinition = {
      position: { x: 1, y: 0 },
      name: () => t(L.TechFortifiedArtillery),
      requires: ["A1"],
      unlockBuildings: ["AC30A"],
   };
   A4: ITechDefinition = {
      position: { x: 1, y: 1 },
      requires: ["A1"],
      name: () => t(L.TechRapidFire),
      unlockBuildings: ["AC30x3"],
   };
   A5: ITechDefinition = {
      position: { x: 1, y: 2 },
      name: () => t(L.TechSystemRecovery),
      requires: ["A2"],
      unlockBuildings: ["MS1A"],
   };
   A6: ITechDefinition = {
      position: { x: 1, y: 3 },
      name: () => t(L.TechReinforcedDefense),
      requires: ["A2"],
      unlockBuildings: ["MS1B"],
   };

   A7: ITechDefinition = {
      position: { x: 2, y: 0 },
      requires: ["A3"],
      name: () => t(L.TechShieldedArtillery),
      unlockBuildings: ["AC30B"],
   };
   A8: ITechDefinition = {
      position: { x: 2, y: 1 },
      name: () => t(L.TechArmorPiercing),
      requires: ["A4"],
      unlockBuildings: ["AC30C"],
   };
   A9: ITechDefinition = {
      position: { x: 2, y: 2 },
      name: () => t(L.CriticalStrike),
      requires: ["A5"],
      unlockBuildings: ["MS1C"],
   };
   A10: ITechDefinition = {
      position: { x: 2, y: 3 },
      name: () => t(L.TechDamageReclaim),
      requires: ["A6"],
      unlockBuildings: ["MS1D"],
   };

   B1: ITechDefinition = {
      position: { x: 3, y: 0 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B2: ITechDefinition = {
      position: { x: 3, y: 1 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B3: ITechDefinition = {
      position: { x: 3, y: 2 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B4: ITechDefinition = {
      position: { x: 3, y: 3 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };

   B5: ITechDefinition = {
      position: { x: 4, y: 0 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B6: ITechDefinition = {
      position: { x: 4, y: 1 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B7: ITechDefinition = {
      position: { x: 4, y: 2 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B8: ITechDefinition = {
      position: { x: 4, y: 3 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };

   B9: ITechDefinition = {
      position: { x: 5, y: 0 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B10: ITechDefinition = {
      position: { x: 5, y: 1 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B11: ITechDefinition = {
      position: { x: 5, y: 2 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   B12: ITechDefinition = {
      position: { x: 5, y: 3 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };

   C1: ITechDefinition = {
      position: { x: 6, y: 0 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   C2: ITechDefinition = {
      position: { x: 6, y: 1 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   C3: ITechDefinition = {
      position: { x: 6, y: 2 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   C4: ITechDefinition = {
      position: { x: 6, y: 3 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };

   C5: ITechDefinition = {
      position: { x: 7, y: 0 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   C6: ITechDefinition = {
      position: { x: 7, y: 1 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   C7: ITechDefinition = {
      position: { x: 7, y: 2 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };
   C8: ITechDefinition = {
      position: { x: 7, y: 3 },
      name: () => t(L.TechLightArtillery),
      requires: [],
      unlockUpgrades: [{ name: () => t(L.Size6x6), desc: () => t(L.Size6x6Desc) }],
   };

   // ////////// R1 //////////
   // B1: ITechDefinition = {
   //    name: () => t(L.TechHydrogen),
   //    ring: 1,
   //    requires: ["A1"],
   //    unlockBuildings: ["HCollector"],
   // };
   // B2: ITechDefinition = {
   //    name: () => t(L.TechTitanium),
   //    ring: 1,
   //    requires: ["A1"],
   //    unlockBuildings: ["TiCollector"],
   // };
   // B3: ITechDefinition = {
   //    name: () => t(L.TechSilicon),
   //    ring: 1,
   //    requires: ["A1"],
   //    unlockBuildings: ["SiCollector"],
   // };
   // B4: ITechDefinition = {
   //    name: () => t(L.TechPhotovoltaics),
   //    ring: 1,
   //    requires: ["A1"],
   //    unlockBuildings: ["SolarPower"],
   // };
   // ////////// R2 //////////
   // C1: ITechDefinition = {
   //    name: () => t(L.TechThermalPower),
   //    ring: 2,
   //    requires: ["B1"],
   //    unlockBuildings: ["H2Reactor"],
   //    multiplier: { HCollector: { production: 1, xp: 1, hp: 1 } },
   // };
   // C2: ITechDefinition = {
   //    name: () => t(L.TechRocketry),
   //    ring: 2,
   //    requires: ["B1", "B2"],
   //    unlockBuildings: ["RocketFab"],
   //    multiplier: {
   //       HCollector: { production: 1, xp: 1 },
   //       TiCollector: { production: 1, xp: 1, hp: 1 },
   //    },
   // };
   // C3: ITechDefinition = {
   //    name: () => t(L.TechLightArtillery),
   //    ring: 2,
   //    requires: ["B3", "B2"],
   //    unlockBuildings: ["AC30"],
   //    multiplier: {
   //       SiCollector: { production: 1, xp: 1 },
   //       TiCollector: { production: 1, xp: 1 },
   //    },
   // };
   // C4: ITechDefinition = {
   //    name: () => t(L.TechSemiconductor),
   //    ring: 2,
   //    requires: ["B3"],
   //    unlockBuildings: ["CircuitFab"],
   //    multiplier: { SiCollector: { production: 1, xp: 1, hp: 1 } },
   // };
   // C5: ITechDefinition = {
   //    name: () => t(L.TechScout),
   //    ring: 2,
   //    requires: ["B3", "B4"],
   //    unlockUpgrades: [{ name: () => t(L.Size8x8), desc: () => t(L.Size8x8Desc) }],
   // };
   // C6: ITechDefinition = {
   //    name: () => t(L.TechRadiation),
   //    ring: 2,
   //    requires: ["B4", "B1"],
   //    unlockBuildings: ["UCollector"],
   //    multiplier: { SolarPower: { production: 1, xp: 1, hp: 1 } },
   // };

   // ////////// R3 //////////
   // D1: ITechDefinition = {
   //    name: () => t(L.TechSystemRecovery),
   //    ring: 3,
   //    requires: ["D2"],
   //    unlockBuildings: ["MS1A"],
   //    multiplier: { MS1: { production: 1, xp: 1 } },
   // };
   // D2: ITechDefinition = {
   //    name: () => t(L.TechMissile),
   //    ring: 3,
   //    requires: ["C2"],
   //    unlockBuildings: ["MS1"],
   //    multiplier: { RocketFab: { production: 1, xp: 1, hp: 1 } },
   // };
   // D3: ITechDefinition = {
   //    name: () => t(L.TechMediumArtillery),
   //    ring: 3,
   //    requires: ["C3"],
   //    unlockBuildings: ["AC76"],
   //    multiplier: { AC30: { production: 1, xp: 1 } },
   // };
   // D4: ITechDefinition = {
   //    name: () => t(L.TechRapidFire),
   //    ring: 3,
   //    requires: ["C3"],
   //    unlockBuildings: ["AC30x3"],
   //    multiplier: { AC30: { production: 1, xp: 1 }, TiCollector: { hp: 1 } },
   // };
   // D5: ITechDefinition = {
   //    name: () => t(L.TechFortifiedArtillery),
   //    ring: 3,
   //    requires: ["D4", "C4"],
   //    unlockBuildings: ["AC30A"],
   //    multiplier: {
   //       AC30x3: { production: 1, xp: 1 },
   //       CircuitFab: { production: 1, xp: 1, hp: 1 },
   //       SiCollector: { hp: 1 },
   //    },
   // };
   // D6: ITechDefinition = {
   //    name: () => t(L.TechCorvette),
   //    ring: 3,
   //    requires: ["C5", "C4"],
   //    unlockUpgrades: [{ name: () => t(L.Size10x10), desc: () => t(L.Size10x10Desc) }],
   // };
   // D7: ITechDefinition = {
   //    name: () => t(L.TechDeuterium),
   //    ring: 3,
   //    requires: ["C6"],
   //    unlockBuildings: ["D2Fab"],
   //    multiplier: {
   //       UCollector: { production: 1, xp: 1 },
   //       HCollector: { production: 1, xp: 1, hp: 1 },
   //    },
   // };
   // D8: ITechDefinition = {
   //    name: () => t(L.TechNuclearFission),
   //    ring: 3,
   //    requires: ["C6", "C1"],
   //    unlockBuildings: ["UReactor"],
   //    multiplier: {
   //       UCollector: { production: 1, xp: 1, hp: 1 },
   //       SolarPower: { hp: 1 },
   //       H2Reactor: { hp: 1 },
   //    },
   // };

   // ////////// R4 //////////
   // E1: ITechDefinition = {
   //    ring: 4,
   //    requires: ["D1"],
   //    name: () => t(L.TechReinforcedDefense),
   //    unlockBuildings: ["MS1B"],
   //    multiplier: { MS1A: { production: 1, xp: 1 } },
   // };
   // E2: ITechDefinition = {
   //    ring: 4,
   //    requires: ["D2"],
   //    name: () => t(L.CriticalStrike),
   //    unlockBuildings: ["MS2", "DMG1Booster"],
   //    multiplier: { MS1: { production: 1, xp: 1 }, RocketFab: { hp: 1 } },
   // };
   // E3: ITechDefinition = {
   //    ring: 4,
   //    requires: ["D2", "D3"],
   //    name: () => t(L.TechRocketArtillery),
   //    unlockBuildings: ["AC76A"],
   //    multiplier: {
   //       AC76: { production: 1, xp: 1 },
   //       RocketFab: { production: 1, xp: 1 },
   //    },
   // };
   // E4: ITechDefinition = {
   //    ring: 4,
   //    requires: ["D4"],
   //    name: () => t(L.TechShieldedArtillery),
   //    unlockBuildings: ["AC30B"],
   //    multiplier: { AC30x3: { production: 1, xp: 1 } },
   // };
   // E5: ITechDefinition = {
   //    name: () => t(L.TechHeavyArtillery),
   //    ring: 4,
   //    requires: ["D4"],
   //    unlockBuildings: ["AC130", "HP1Booster"],
   //    multiplier: {
   //       AC30x3: { production: 1, xp: 1 },
   //       TiCollector: { hp: 1 },
   //    },
   // };
   // E6: ITechDefinition = {
   //    ring: 4,
   //    requires: ["D5"],
   //    name: () => t(L.TechRailCannon),
   //    unlockBuildings: ["RC50"],
   //    multiplier: {
   //       AC30A: { production: 1, xp: 1 },
   //       CircuitFab: { production: 1, xp: 1 },
   //    },
   // };
   // E7: ITechDefinition = {
   //    ring: 4,
   //    requires: ["E6"],
   //    name: () => t(L.TechOffenseDisruptor),
   //    unlockBuildings: ["RC100", "PM1Booster"],
   //    multiplier: {
   //       RC50: { production: 1, xp: 1 },
   //       SiCollector: { hp: 1 },
   //       CircuitFab: { hp: 1 },
   //    },
   // };
   // E8: ITechDefinition = {
   //    name: () => t(L.TechFrigate),
   //    ring: 4,
   //    requires: ["D6"],
   //    unlockUpgrades: [{ name: () => t(L.Size12x12), desc: () => t(L.Size12x12Desc) }],
   // };
   // E9: ITechDefinition = {
   //    name: () => t(L.TechNuclearFusion),
   //    ring: 4,
   //    requires: ["D8", "D7"],
   //    unlockBuildings: ["D2Reactor"],
   //    multiplier: {
   //       D2Fab: { production: 1, xp: 1, hp: 1 },
   //       HCollector: { hp: 1 },
   //       UCollector: { hp: 1 },
   //    },
   // };
   // E10: ITechDefinition = {
   //    ring: 4,
   //    name: () => t(L.TechLaserArray),
   //    requires: ["D8", "D1"],
   //    unlockBuildings: ["LA1", "EVA1Booster"],
   //    multiplier: {
   //       UCollector: { production: 1, xp: 1 },
   //       MS1A: { production: 1, xp: 1 },
   //       UReactor: { hp: 1 },
   //       H2Reactor: { hp: 1 },
   //       SolarPower: { hp: 1 },
   //    },
   // };

   // ////////// R5 //////////
   // F1: ITechDefinition = {
   //    ring: 5,
   //    name: () => t(L.TechEchoShield),
   //    unlockBuildings: ["MS2C"],
   //    requires: ["E1", "F2"],
   //    multiplier: {
   //       MS2B: { production: 1, xp: 1 },
   //       MS1B: { production: 1, xp: 1 },
   //    },
   // };
   // F2: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E2"],
   //    name: () => t(L.TechDamageControl),
   //    unlockBuildings: ["MS2B"],
   //    multiplier: { MS2: { production: 1, xp: 1 }, RocketFab: { hp: 1 } },
   // };
   // F3: ITechDefinition = {
   //    name: () => t(L.TechDamageReclaim),
   //    ring: 5,
   //    requires: ["E2", "E3"],
   //    unlockBuildings: ["MS2A"],
   //    multiplier: {
   //       MS2: { production: 1, xp: 1 },
   //       AC76A: { production: 1, xp: 1 },
   //    },
   // };
   // F4: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E3"],
   //    name: () => t(L.TechArmorPiercing),
   //    unlockBuildings: ["AC76x2"],
   //    multiplier: { AC76A: { production: 1, xp: 1 } },
   // };
   // F5: ITechDefinition = {
   //    ring: 5,
   //    name: () => t(L.TechDefenseBreaker),
   //    requires: ["E5"],
   //    unlockBuildings: ["AC130B"],
   //    multiplier: { AC130: { production: 1, xp: 1 } },
   // };
   // F6: ITechDefinition = {
   //    name: () => t(L.TechHeavyExplosives),
   //    ring: 5,
   //    requires: ["E5"],
   //    unlockBuildings: ["AC130A"],
   //    multiplier: { AC130: { production: 1, xp: 1 }, TiCollector: { hp: 1 } },
   // };
   // F7: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E6"],
   //    name: () => t(L.TechEvasionMatrix),
   //    unlockBuildings: ["RC50A"],
   //    multiplier: { RC50: { production: 1, xp: 1 }, SiCollector: { hp: 1 }, CircuitFab: { hp: 1 } },
   // };
   // F8: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E7"],
   //    name: () => t(L.TechReactiveRegen),
   //    unlockBuildings: ["RC100A"],
   //    multiplier: { RC100: { production: 1, xp: 1 } },
   // };
   // F9: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E7"],
   //    name: () => t(L.TechProactiveRegen),
   //    unlockBuildings: ["RC100B"],
   //    multiplier: { RC100: { production: 1, xp: 1 } },
   // };
   // F10: ITechDefinition = {
   //    name: () => t(L.TechDestroyer),
   //    ring: 5,
   //    requires: ["E8"],
   //    unlockUpgrades: [{ name: () => t(L.Size14x14), desc: () => t(L.Size14x14Desc) }],
   // };
   // F11: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E9"],
   //    name: () => t(L.TechAntimatter),
   //    unlockBuildings: ["AntimatterFab"],
   //    multiplier: {
   //       D2Fab: { production: 1, xp: 1, hp: 1 },
   //       D2Reactor: { hp: 1 },
   //       HCollector: { hp: 1 },
   //       UReactor: { hp: 1 },
   //    },
   // };
   // F12: ITechDefinition = {
   //    ring: 5,
   //    requires: ["E10"],
   //    name: () => t(L.TechLaserExplosive),
   //    unlockBuildings: ["LA1A"],
   //    multiplier: {
   //       LA1: { production: 1, xp: 1 },
   //       UCollector: { hp: 1 },
   //       H2Reactor: { hp: 1 },
   //       SolarPower: { hp: 1 },
   //    },
   // };

   // ////////// R6 //////////
   // G1: ITechDefinition = {
   //    ring: 6,
   //    name: () => t(L.TechLaserDisruptor),
   //    requires: ["G14", "F1"],
   //    unlockBuildings: ["LA2A"],
   //    multiplier: {
   //       LA2: { production: 1, xp: 1 },
   //       MS2C: { production: 1, xp: 1 },
   //    },
   // };
   // G2: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F2"],
   //    name: () => t(L.TechFPVDrone),
   //    unlockBuildings: ["FD1"],
   //    multiplier: { MS2B: { production: 1, xp: 1 }, RocketFab: { hp: 1 } },
   // };
   // G3: ITechDefinition = {
   //    ring: 6,
   //    name: () => t(L.TechProductionDisruption),
   //    requires: ["F2", "F3"],
   //    unlockBuildings: ["MS3"],
   //    multiplier: {
   //       MS2A: { production: 1, xp: 1 },
   //       MS2B: { production: 1, xp: 1 },
   //    },
   // };
   // G4: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F3"],
   //    name: () => t(L.TechDebuffDispel),
   //    unlockBuildings: ["MS2D"],
   //    multiplier: { MS2A: { production: 1, xp: 1 } },
   // };
   // G5: ITechDefinition = {
   //    ring: 6,
   //    name: () => t(L.TechBuffDispel),
   //    requires: ["E4", "F4"],
   //    unlockBuildings: ["AC76B"],
   //    multiplier: {
   //       AC30B: { production: 1, xp: 1 },
   //       AC76x2: { production: 1, xp: 1 },
   //    },
   // };
   // G6: ITechDefinition = {
   //    ring: 6,
   //    name: () => t(L.TechDefenseCluster),
   //    requires: ["F5"],
   //    unlockBuildings: ["AC130C"],
   //    multiplier: {
   //       AC130A: { production: 1, xp: 1 },
   //       AC130B: { production: 1, xp: 1 },
   //    },
   // };
   // G7: ITechDefinition = {
   //    ring: 6,
   //    name: () => t(L.TechPlasmaCannon),
   //    requires: ["F6"],
   //    unlockBuildings: ["PC1"],
   //    multiplier: {
   //       AC130A: { production: 1, xp: 1 },
   //       RC50A: { production: 1, xp: 1 },
   //       TiCollector: { hp: 1 },
   //    },
   // };
   // G8: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F7"],
   //    name: () => t(L.TechPrecisionStrike),
   //    unlockBuildings: ["RC50B"],
   //    multiplier: { RC50A: { production: 1, xp: 1 }, SiCollector: { hp: 1 }, CircuitFab: { hp: 1 } },
   // };
   // G9: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F7", "F8"],
   //    name: () => t(L.TechLastStandRegen),
   //    unlockBuildings: ["RC100D"],
   //    multiplier: {
   //       RC100A: { production: 1, xp: 1 },
   //       RC50A: { production: 1, xp: 1 },
   //    },
   // };
   // G10: ITechDefinition = {
   //    ring: 6,
   //    name: () => t(L.TechFailsafeRegen),
   //    requires: ["F8", "F9"],
   //    unlockBuildings: ["RC100C"],
   //    multiplier: {
   //       RC100A: { production: 1, xp: 1 },
   //       RC100B: { production: 1, xp: 1 },
   //    },
   // };
   // G11: ITechDefinition = {
   //    name: () => t(L.TechCruiser),
   //    ring: 6,
   //    requires: ["F10"],
   //    unlockUpgrades: [{ name: () => t(L.Size16x16), desc: () => t(L.Size16x16Desc) }],
   // };
   // G12: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F11"],
   //    name: () => t(L.TechMatterCollision),
   //    unlockBuildings: ["AntimatterReactor"],
   //    multiplier: {
   //       AntimatterFab: { production: 1, xp: 1, hp: 1 },
   //       D2Fab: { hp: 1 },
   //       UCollector: { hp: 1 },
   //       HCollector: { hp: 1 },
   //    },
   // };
   // G13: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F12"],
   //    name: () => t(L.TechDefenseInfiltrate),
   //    unlockBuildings: ["LA1B"],
   //    multiplier: {
   //       LA1A: { production: 1, xp: 1 },
   //       H2Reactor: { hp: 1 },
   //       UReactor: { hp: 1 },
   //       D2Reactor: { hp: 1 },
   //       SolarPower: { hp: 1 },
   //    },
   // };
   // G14: ITechDefinition = {
   //    ring: 6,
   //    requires: ["F12"],
   //    name: () => t(L.TechLaserCorruptor),
   //    unlockBuildings: ["LA2"],
   //    multiplier: { LA1A: { production: 1, xp: 1 } },
   // };

   // ////////// R7 //////////
   // H1: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H2: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H3: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H4: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H5: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H6: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H7: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H8: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H9: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H10: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H11: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H12: ITechDefinition = {
   //    name: () => t(L.TechBattlecruiser),
   //    ring: 7,
   //    requires: ["G11"],
   //    unlockUpgrades: [{ name: () => t(L.Size18x18), desc: () => t(L.Size18x18Desc) }],
   // };
   // H13: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H14: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H15: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };
   // H16: ITechDefinition = {
   //    ring: 7,
   //    requires: [],
   // };

   // ////////// R8 //////////
   // I1: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I2: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I3: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I4: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I5: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I6: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I7: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I8: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I9: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I10: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I11: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I12: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I13: ITechDefinition = {
   //    name: () => t(L.TechDreadnought),
   //    ring: 8,
   //    requires: ["H12"],
   //    unlockUpgrades: [{ name: () => t(L.Size20x20), desc: () => t(L.Size20x20Desc) }],
   // };
   // I14: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I15: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I16: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I17: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };
   // I18: ITechDefinition = {
   //    ring: 8,
   //    requires: [],
   // };

   // ////////// R9 //////////
   // J1: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J2: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J3: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J4: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J5: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J6: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J7: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J8: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J9: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J10: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J11: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J12: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J13: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J14: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J15: ITechDefinition = {
   //    name: () => t(L.TechCarrier),
   //    ring: 9,
   //    requires: ["I13"],
   //    unlockUpgrades: [{ name: () => t(L.Size22x22), desc: () => t(L.Size22x22Desc) }],
   // };
   // J16: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J17: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J18: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J19: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
   // J20: ITechDefinition = {
   //    ring: 9,
   //    requires: [],
   // };
}

export type Tech = keyof TechDefinitions;
