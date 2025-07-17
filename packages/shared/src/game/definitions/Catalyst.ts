import { mapCount } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import type { GameState } from "../GameState";
import type { Building } from "./Buildings";
import { CodeNumber } from "./CodeNumber";

export interface ICatalystDefinition {
   requirement: () => string;
   effect: () => string;
   filter: (b: Building) => boolean;
   progress: (self: ICatalystDefinition, gs: GameState) => [number, number];
}

function countFilter(self: ICatalystDefinition, gs: GameState): number {
   return mapCount(gs.tiles, (data, _tile) => self.filter(data.type));
}

export const Catalyst = {
   A1: {
      requirement: () => t(L.BuildXDifferentAutocannons, 3),
      effect: () => t(L.AllAutocannonsGetXDamageMultiplier, 1),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.AC,
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 3],
   },
   A2: {
      requirement: () => t(L.BuildXDifferentMissiles, 3),
      effect: () => t(L.AllMissilesGetXDamageMultiplier, 1),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.MS,
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 3],
   },
   A3: {
      requirement: () => t(L.BuildXDifferentSkiffClassWeapons, 6),
      effect: () => t(L.AllSkiffClassWeaponsGetXDamageMultiplier, 2),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 6],
   },
} as const satisfies Record<string, ICatalystDefinition>;
