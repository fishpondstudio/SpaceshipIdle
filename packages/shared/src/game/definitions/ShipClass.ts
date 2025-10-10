import { keysOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export const _ShipClass = {
   Skiff: {
      name: () => t(L.TechSkiff),
      range: [0, 2],
      elementLevels: 0,
   },
   Scout: {
      name: () => t(L.TechScout),
      range: [3, 5],
      elementLevels: 5,
   },
   Corvette: {
      name: () => t(L.TechCorvette),
      range: [6, 8],
      elementLevels: 10,
   },
   Frigate: {
      name: () => t(L.TechFrigate),
      range: [9, 11],
      elementLevels: 20,
   },
   Destroyer: {
      name: () => t(L.TechDestroyer),
      range: [12, 14],
      elementLevels: 30,
   },
   Cruiser: {
      name: () => t(L.TechCruiser),
      range: [15, 17],
      elementLevels: 40,
   },
   Battlecruiser: {
      name: () => t(L.TechBattlecruiser),
      range: [18, 20],
      elementLevels: 50,
   },
   Dreadnought: {
      name: () => t(L.TechDreadnought),
      range: [21, 23],
      elementLevels: 60,
   },
   Carrier: {
      name: () => t(L.TechCarrier),
      range: [24, 26],
      elementLevels: 70,
   },
} as const satisfies Record<string, IShipClassDefinition>;

export const ShipClassList = keysOf(_ShipClass);
export type ShipClass = keyof typeof _ShipClass;
export const ShipClass: Record<ShipClass, IShipClassDefinition> = _ShipClass;

export interface IShipClassDefinition {
   name: () => string;
   range: [number, number];
   elementLevels: number;
}
