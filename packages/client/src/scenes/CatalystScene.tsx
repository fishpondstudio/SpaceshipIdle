import type { ColorSource } from "pixi.js";
import { CatalystFullScreen } from "../ui/CalalystFullScreen";
import { setFullScreen } from "../ui/FullScreen";
import { Scene } from "../utils/SceneManager";

export class CatalystScene extends Scene {
   backgroundColor(): ColorSource {
      return 0x000000;
   }
   id(): string {
      return CatalystScene.name;
   }
   onEnable(): void {
      setFullScreen(<CatalystFullScreen />);
   }
   onDisable(): void {
      setFullScreen(null);
   }
}
