import { ElementsScene } from "./scenes/ElementsScene";
import { ShipScene } from "./scenes/ShipScene";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { G } from "./utils/Global";

export function loadGameScene() {
   const params = new URLSearchParams(location.href.split("?")[1]);
   const scene = params.get("scene")?.toLowerCase();
   switch (scene) {
      case "tech": {
         G.scene.loadScene(TechTreeScene);
         break;
      }
      case "elements": {
         G.scene.loadScene(ElementsScene);
         break;
      }
      default: {
         G.scene.loadScene(ShipScene);
         break;
      }
   }
}
