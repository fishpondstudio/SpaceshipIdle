import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import type { Multipliers } from "../logic/IMultiplier";
import type { Building } from "./Buildings";
import { CodeNumber } from "./CodeNumber";

export interface ICatalystDefinition {
   trait: () => string;
   filter: (b: Building) => boolean;
   amount: number;
   multipliers: Multipliers;
}

export const Catalyst = {
   A1: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.AC,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   A2: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.AC,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
   A3: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.MS,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   A4: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.MS,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
   A5: {
      trait: () => t(L.TechSkiff),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      amount: 6,
      multipliers: {
         damage: 2,
      },
   },
   A6: {
      trait: () => t(L.TechSkiff),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      amount: 6,
      multipliers: {
         hp: 2,
      },
   },
   A7: {
      trait: () => t(L.TechSkiff),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      amount: 6,
      multipliers: {
         hp: 1,
         damage: 1,
      },
   },
} as const satisfies Record<string, ICatalystDefinition>;

export type Catalyst = keyof typeof Catalyst;

export const CatalystCat = {
   C1: ["A1", "A2", "A3", "A4", "A5", "A6"] as const,
} as const satisfies Record<string, Catalyst[]>;

export type CatalystCat = keyof typeof CatalystCat;
