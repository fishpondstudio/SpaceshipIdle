import type { ColorSource } from "pixi.js";
import { BoosterFullScreen } from "../ui/BoosterFullScreen";
import { setFullScreen } from "../ui/FullScreen";
import { Scene } from "../utils/SceneManager";

export class BoosterScene extends Scene {
   backgroundColor(): ColorSource {
      return 0x000000;
   }
   id(): string {
      return BoosterScene.name;
   }
   onEnable(): void {
      setFullScreen(<BoosterFullScreen />);
   }
   onDisable(): void {
      setFullScreen(null);
   }
}
