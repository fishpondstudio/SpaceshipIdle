import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { RingBuffer } from "@spaceship-idle/shared/src/utils/RingBuffer";
import { BitmapText, Container, Geometry, type IDestroyOptions, Mesh, Shader } from "pixi.js";
import { Fonts } from "../assets";
import { getVersion } from "../game/Version";
import { G } from "../utils/Global";
import vert from "./shader.vert?raw";
import frag from "./starfield.frag?raw";

export class Starfield extends Container {
   private quad: Mesh<Shader>;
   private fps: RingBuffer<number>;
   private watermark: BitmapText;
   private version: string;
   private shader: Shader;

   constructor() {
      super();
      const app = G.pixi;
      const quadGeometry = new Geometry()
         .addAttribute("aVertexPosition", [-100, -100, 100, -100, 100, 100, -100, 100], 2)
         .addAttribute("aUvs", [0, 0, 1, 0, 1, 1, 0, 1], 2)
         .addIndex([0, 1, 2, 0, 2, 3]);
      this.shader = Shader.from(vert, frag, {
         iTime: Math.random() * 1_000_000,
         iResolution: [app.renderer.width, app.renderer.height, 1],
         iStrength: 1,
      });
      this.quad = this.addChild(new Mesh(quadGeometry, this.shader));

      this.version = getVersion();
      this.watermark = G.scene.overlay.addChild(
         new BitmapText("", { fontName: Fonts.SpaceshipIdle, fontSize: 12, tint: 0x999999, align: "right" }),
      );
      this.watermark.anchor.set(1, 1);
      this.fps = new RingBuffer<number>(120);

      this.onResize();
      G.pixi.renderer.on("resize", this.onResize, this);
      GameOptionUpdated.on(this.updateNebulaStrength.bind(this));
   }

   public updateNebulaStrength(): void {
      this.shader.uniforms.iStrength = G.save.options.nebulaStrength;
   }

   onResize() {
      const app = G.pixi;
      this.quad.shader.uniforms.iResolution = [app.renderer.width, app.renderer.height, 1];
      this.quad.width = app.renderer.width;
      this.quad.height = app.renderer.height;
      this.quad.x = app.renderer.width / 2;
      this.quad.y = app.renderer.height / 2;
      this.watermark.position.set(app.screen.width - 10, app.screen.height - 10);
   }

   override destroy(options?: IDestroyOptions | boolean): void {
      super.destroy(options);
   }

   public update(): void {
      this.fps.push(G.pixi.ticker.FPS);
      this.watermark.text = `TICK: ${G.save.data.tick}    FPS: ${Math.round(this.fps.reduce(sum, 0) / this.fps.size)}    VERSION: ${this.version}    ${navigator.onLine ? "ONLINE" : "OFFLINE"}`;
      this.shader.uniforms.iTime += G.pixi.ticker.elapsedMS / 1000;
   }
}

function sum(result: number, value: number): number {
   return result + value;
}
