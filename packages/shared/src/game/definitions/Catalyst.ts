import { keysOf, numberToRoman } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import type { Multipliers } from "../logic/IMultiplier";
import type { Building } from "./Buildings";
import { BuildingType } from "./BuildingType";

export interface ICatalystDefinition {
   trait: () => string;
   filter: (b: Building) => boolean;
   amount: number;
   multipliers: Multipliers;
}

export const _Catalyst = {
   A1: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   A2: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
   A3: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   A4: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
   A5: {
      trait: () => t(L.XClassWeapon, t(L.TechSkiff)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      amount: 6,
      multipliers: {
         damage: 2,
      },
   },
   A6: {
      trait: () => t(L.XClassWeapon, t(L.TechSkiff)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      amount: 6,
      multipliers: {
         hp: 2,
      },
   },
   A7: {
      trait: () => t(L.XClassWeapon, t(L.TechSkiff)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Skiff",
      amount: 6,
      multipliers: {
         hp: 1,
         damage: 1,
      },
   },
   A8: {
      trait: () => t(L.WeaponWithoutAbility),
      filter: (b: Building) => !Config.Buildings[b].ability,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
   A9: {
      trait: () => t(L.WeaponWithoutAbility),
      filter: (b: Building) => !Config.Buildings[b].ability,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   B1: {
      trait: () => t(L.XClassWeapon, t(L.TechScout)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Scout",
      amount: 6,
      multipliers: {
         hp: 1,
         damage: 1,
      },
   },
   B2: {
      trait: () => t(L.XClassWeapon, t(L.TechScout)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Scout",
      amount: 6,
      multipliers: {
         hp: 2,
      },
   },
   B3: {
      trait: () => t(L.XClassWeapon, t(L.TechScout)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Scout",
      amount: 6,
      multipliers: {
         damage: 2,
      },
   },
   B4: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 6,
      multipliers: {
         damage: 2,
      },
   },
   B5: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 6,
      multipliers: {
         hp: 2,
      },
   },
   B6: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 6,
      multipliers: {
         damage: 1,
         hp: 1,
      },
   },
   B7: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 6,
      multipliers: {
         damage: 1,
         hp: 1,
      },
   },
   B8: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 6,
      multipliers: {
         damage: 2,
      },
   },
   B9: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 6,
      multipliers: {
         hp: 2,
      },
   },
   B10: {
      trait: () => t(L.RC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.RC,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   B11: {
      trait: () => t(L.RC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.RC,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
   C1: {
      trait: () => t(L.XClassWeapon, t(L.TechCorvette)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Corvette",
      amount: 6,
      multipliers: {
         hp: 1,
         damage: 1,
      },
   },
   C2: {
      trait: () => t(L.XClassWeapon, t(L.TechCorvette)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Corvette",
      amount: 6,
      multipliers: {
         hp: 2,
      },
   },
   C3: {
      trait: () => t(L.XClassWeapon, t(L.TechCorvette)),
      filter: (b: Building) => Config.BuildingToShipClass[b] === "Corvette",
      amount: 6,
      multipliers: {
         damage: 2,
      },
   },
   C4: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 9,
      multipliers: {
         damage: 3,
      },
   },
   C5: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 9,
      multipliers: {
         hp: 3,
      },
   },
   C6: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 9,
      multipliers: {
         damage: 1,
         hp: 2,
      },
   },
   C7: {
      trait: () => t(L.MS),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.MS,
      amount: 9,
      multipliers: {
         damage: 2,
         hp: 1,
      },
   },
   C8: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 9,
      multipliers: {
         damage: 3,
      },
   },
   C9: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 9,
      multipliers: {
         hp: 3,
      },
   },
   C10: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 9,
      multipliers: {
         damage: 1,
         hp: 2,
      },
   },
   C11: {
      trait: () => t(L.AC),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.AC,
      amount: 9,
      multipliers: {
         damage: 2,
         hp: 1,
      },
   },
   C12: {
      trait: () => t(L.LA),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.LA,
      amount: 3,
      multipliers: {
         damage: 1,
      },
   },
   C13: {
      trait: () => t(L.LA),
      filter: (b: Building) => Config.Buildings[b].type === BuildingType.LA,
      amount: 3,
      multipliers: {
         hp: 1,
      },
   },
} as const satisfies Record<string, ICatalystDefinition>;

export type Catalyst = keyof typeof _Catalyst;
export const Catalyst: Record<Catalyst, ICatalystDefinition> = _Catalyst;

export const CatalystCat = {
   C1: {
      name: () => t(L.CatalystCatX, numberToRoman(1)!),
      candidates: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"],
   },
   C2: {
      name: () => t(L.CatalystCatX, numberToRoman(2)!),
      candidates: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"],
   },
   C3: {
      name: () => t(L.CatalystCatX, numberToRoman(3)!),
      candidates: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12", "C13"],
   },
} as const satisfies Record<string, { name: () => string; candidates: Catalyst[] }>;

export const CatalystCatList = keysOf(CatalystCat);

export type CatalystCat = keyof typeof CatalystCat;
