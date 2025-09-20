import { cast, createTile, forEach } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { MaxX, MaxY } from "../Grid";
import type { Runtime } from "../logic/Runtime";
import { Bonus } from "./Bonus";
import { CodeNumber } from "./CodeNumber";
import { Horizon } from "./Horizon";
import { Intrepid } from "./Intrepid";
import { Odyssey } from "./Odyssey";
import { Orion } from "./Orion";
import { Pioneer } from "./Pioneer";
import type { ShipClass } from "./ShipClass";
import { Voyager } from "./Voyager";

export type BlueprintDefinition = Record<ShipClass, number[]>;

export interface IBlueprint {
   name: () => string;
   blueprint: BlueprintDefinition;
   elementLevel: number;
   desc?: () => string;
   tick?: (runtime: Runtime) => void;
}

export const Blueprints = {
   Odyssey: cast<IBlueprint>({ name: () => t(L.Odyssey), blueprint: Odyssey, elementLevel: 0 }),
   Voyager: cast<IBlueprint>({
      name: () => t(L.Voyager),
      blueprint: Voyager,
      elementLevel: 5,
      desc: () => t(L.VoyagerDesc),
      tick: (runtime: Runtime) => {
         Bonus.Get10ExtraXPPerSec.onTick?.(Number.POSITIVE_INFINITY, t(L.SpaceshipPrefix, t(L.Voyager)), runtime);
      },
   }),
   Pioneer: cast<IBlueprint>({
      name: () => t(L.Pioneer),
      blueprint: Pioneer,
      elementLevel: 10,
      desc: () => t(L.PioneerDesc),
   }),
   Horizon: cast<IBlueprint>({
      name: () => t(L.Horizon),
      blueprint: Horizon,
      elementLevel: 15,
      desc: () => t(L.HorizonDesc),
      tick: (runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            if (Config.Buildings[data.type].code === CodeNumber.AC) {
               runtime.get(tile)?.xpMultiplier.add(1, t(L.SpaceshipPrefix, t(L.Horizon)));
            }
         });
      },
   }),
   Intrepid: cast<IBlueprint>({
      name: () => t(L.Intrepid),
      blueprint: Intrepid,
      elementLevel: 20,
      desc: () => t(L.IntrepidDesc),
   }),
   Orion: cast<IBlueprint>({
      name: () => t(L.Orion),
      blueprint: Orion,
      elementLevel: 25,
      desc: () => t(L.OrionDesc),
   }),
} as const satisfies Record<string, IBlueprint>;

export type Blueprint = keyof typeof Blueprints;

forEach(Blueprints, (key, def) => {
   const design = def.blueprint;
   forEach(design, (shipClass, layout) => {
      if (key === "Orion") {
         console.assert(
            layout.length === Math.floor((Odyssey[shipClass].length * 1.1) / 2) * 2,
            `Design ${key}: ${shipClass} class has ${layout.length} tiles, expected ${Odyssey[shipClass].length}`,
         );
         return;
      }
      console.assert(
         layout.length === Odyssey[shipClass].length,
         `Design ${key}: ${shipClass} class has ${layout.length} tiles, expected ${Odyssey[shipClass].length}`,
      );

      if (layout.length > 0) {
         const x = MaxX / 2 - 2;
         console.assert(layout.includes(createTile(x, MaxY / 2)), `Design ${key}: required tile not found`);
         console.assert(layout.includes(createTile(x - 1, MaxY / 2)), `Design ${key}: required tile not found`);
         console.assert(layout.includes(createTile(x, MaxY / 2 - 1)), `Design ${key}: required tile not found`);
         console.assert(layout.includes(createTile(x - 1, MaxY / 2 - 1)), `Design ${key}: required tile not found`);
      }
   });
});
