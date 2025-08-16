import { CatalystScene } from "../scenes/CatalystScene";
import { ElementsScene } from "../scenes/ElementsScene";
import { GalaxyScene } from "../scenes/GalaxyScene";
import { ShipScene } from "../scenes/ShipScene";
import { TechTreeScene } from "../scenes/TechTreeScene";

export const Scenes = {
   ElementsScene: ElementsScene.name,
   ShipScene: ShipScene.name,
   TechTreeScene: TechTreeScene.name,
   CatalystScene: CatalystScene.name,
   GalaxyScene: GalaxyScene.name,
} as const;
