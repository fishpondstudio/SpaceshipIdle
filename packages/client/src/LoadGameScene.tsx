import { CatalystScene } from "./scenes/CatalystScene";
import { ElementsScene } from "./scenes/ElementsScene";
import { GalaxyScene } from "./scenes/GalaxyScene";
import { ShipScene } from "./scenes/ShipScene";
import { TechTreeScene } from "./scenes/TechTreeScene";
import { BoosterPage } from "./ui/BoosterPage";
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
      case "catalyst": {
         G.scene.loadScene(CatalystScene);
         break;
      }
      case "booster": {
         setSidebar(<BoosterPage />);
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
