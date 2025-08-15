import type { ColorSource } from "pixi.js";
import { DirectiveFullScreen } from "../ui/DirectiveFullScreen";
import { setFullScreen } from "../ui/FullScreen";
import { Scene } from "../utils/SceneManager";

export class DirectiveScene extends Scene {
   backgroundColor(): ColorSource {
      return 0x000000;
   }
   id(): string {
      return DirectiveScene.name;
   }
   onEnable(): void {
      setFullScreen(<DirectiveFullScreen />);
   }
   onDisable(): void {
      setFullScreen(null);
   }
}
