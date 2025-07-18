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
      requirement: () => t(L.CatalystBuildXDifferentY, 3, t(L.AC)),
      effect: () => t(L.CatalystAllXGetYMultiplier, t(L.AC), 1, t(L.CatalystDamageMultiplier)),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.AC,
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 3],
   },
   A2: {
      requirement: () => t(L.CatalystBuildXDifferentY, 3, t(L.AC)),
      effect: () => t(L.CatalystAllXGetYMultiplier, t(L.AC), 1, t(L.CatalystHPMultiplier)),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.AC,
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 3],
   },
   A3: {
      requirement: () => t(L.CatalystBuildXDifferentY, 3, t(L.MS)),
      effect: () => t(L.CatalystAllXGetYMultiplier, t(L.MS), 1, t(L.CatalystDamageMultiplier)),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.MS,
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 3],
   },
   A4: {
      requirement: () => t(L.CatalystBuildXDifferentY, 3, t(L.MS)),
      effect: () => t(L.CatalystAllXGetYMultiplier, t(L.MS), 1, t(L.CatalystHPMultiplier)),
      filter: (b: Building) => Config.Buildings[b].code === CodeNumber.MS,
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 3],
   },
   A5: {
      requirement: () => t(L.CatalystBuildXDifferentY, 6, t(L.CatalystXClass, L.TechSkiff)),
      effect: () => t(L.CatalystAllXGetYMultiplier, t(L.CatalystXClass, L.TechSkiff), 2, t(L.CatalystDamageMultiplier)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 6],
   },
   A6: {
      requirement: () => t(L.CatalystBuildXDifferentY, 6, t(L.CatalystXClass, L.TechSkiff)),
      effect: () => t(L.CatalystAllXGetYMultiplier, t(L.CatalystXClass, L.TechSkiff), 2, t(L.CatalystHPMultiplier)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      progress: (self: ICatalystDefinition, gs: GameState) => [countFilter(self, gs), 6],
   },
} as const satisfies Record<string, ICatalystDefinition>;

export type Catalyst = keyof typeof Catalyst;

export const CatalystCat = {
   C1: ["A1", "A2", "A3", "A4", "A5", "A6"] as const,
} as const satisfies Record<string, Catalyst[]>;

export type CatalystCat = keyof typeof CatalystCat;
