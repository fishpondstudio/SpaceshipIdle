import { cast, keysOf } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export const ShipClass = {
   Skiff: cast<IShipClassDefinition>({
      name: () => t(L.TechSkiff),
      range: [0, 2],
      elementLevels: 0,
   }),
   Scout: cast<IShipClassDefinition>({
      name: () => t(L.TechScout),
      range: [3, 5],
      elementLevels: 5,
   }),
   Corvette: cast<IShipClassDefinition>({
      name: () => t(L.TechCorvette),
      range: [6, 8],
      elementLevels: 10,
   }),
   Frigate: cast<IShipClassDefinition>({
      name: () => t(L.TechFrigate),
      range: [9, 11],
      elementLevels: 20,
   }),
   Destroyer: cast<IShipClassDefinition>({
      name: () => t(L.TechDestroyer),
      range: [12, 14],
      elementLevels: 30,
   }),
   Cruiser: cast<IShipClassDefinition>({
      name: () => t(L.TechCruiser),
      range: [15, 17],
      elementLevels: 40,
   }),
   Battlecruiser: cast<IShipClassDefinition>({
      name: () => t(L.TechBattlecruiser),
      range: [18, 20],
      elementLevels: 50,
   }),
   Dreadnought: cast<IShipClassDefinition>({
      name: () => t(L.TechDreadnought),
      range: [21, 23],
      elementLevels: 60,
   }),
   Carrier: cast<IShipClassDefinition>({
      name: () => t(L.TechCarrier),
      range: [24, 26],
      elementLevels: 70,
   }),
} as const satisfies Record<string, IShipClassDefinition>;

export const ShipClassList = keysOf(ShipClass);

export type ShipClass = keyof typeof ShipClass;
export interface IShipClassDefinition {
   name: () => string;
   range: [number, number];
   elementLevels: number;
}
