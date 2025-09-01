import { ElementsScene } from "./scenes/ElementsScene";
import { GalaxyScene } from "./scenes/GalaxyScene";
import { ShipScene } from "./scenes/ShipScene";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { AddonPage } from "./ui/AddonPage";
import { DirectivePage } from "./ui/DirectivePage";
import { setSidebar } from "./ui/Sidebar";
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
      case "addon": {
         setSidebar(<AddonPage />);
         break;
      }
      case "directive": {
         setSidebar(<DirectivePage />);
         break;
      }
      case "galaxy": {
         G.scene.loadScene(GalaxyScene);
         break;
      }
      default: {
         G.scene.loadScene(ShipScene);
         break;
      }
   }
}
