import { forEach } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Horizon } from "./Horizon";
import { Odyssey } from "./Odyssey";
import { Pioneer } from "./Pioneer";
import type { ShipClass } from "./ShipClass";
import { Voyager } from "./Voyager";

export type BlueprintDefinition = Record<ShipClass, number[]>;

export interface IBlueprint {
   name: () => string;
   blueprint: BlueprintDefinition;
   elementLevel: number;
}

export const Blueprints = {
   Odyssey: { name: () => t(L.Odyssey), blueprint: Odyssey, elementLevel: 0 },
   Voyager: { name: () => t(L.Voyager), blueprint: Voyager, elementLevel: 5 },
   Pioneer: { name: () => t(L.Pioneer), blueprint: Pioneer, elementLevel: 10 },
   Horizon: { name: () => t(L.Horizon), blueprint: Horizon, elementLevel: 15 },
} as const satisfies Record<string, IBlueprint>;

export type Blueprint = keyof typeof Blueprints;

forEach(Blueprints, (key, def) => {
   const design = def.blueprint;
   forEach(design, (shipClass, layout) => {
      console.assert(
         layout.length === Odyssey[shipClass].length,
         `Design ${key}: ${shipClass} class has ${layout.length} tiles, expected ${Odyssey[shipClass].length}`,
      );
   });
});
