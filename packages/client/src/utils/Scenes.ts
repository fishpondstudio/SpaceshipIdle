import { ElementsScene } from "../scenes/ElementsScene";
import { ShipScene } from "../scenes/ShipScene";
import { TechTreeScene } from "../scenes/TechTreeScene";

export const Scenes = {
   ElementsScene: ElementsScene.name,
   ShipScene: ShipScene.name,
   TechTreeScene: TechTreeScene.name,
} as const;
