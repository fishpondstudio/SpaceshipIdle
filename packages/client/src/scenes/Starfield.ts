import type { IHaveXY } from "@spaceship-idle/shared/src/utils/Vector2";
import { Container, Geometry, type IDestroyOptions, Mesh, Shader, Sprite, type Texture } from "pixi.js";
import { runFunc, sequence, to } from "../utils/actions/Actions";
import { Easing } from "../utils/actions/Easing";
import { G } from "../utils/Global";
import vert from "./shader.vert?raw";
import frag from "./starfield.frag?raw";

export class Starfield extends Container {
   private quad: Mesh<Shader>;

   constructor() {
      super();
      const app = G.pixi;
      const quadGeometry = new Geometry()
         .addAttribute("aVertexPosition", [-100, -100, 100, -100, 100, 100, -100, 100], 2)
         .addAttribute("aUvs", [0, 0, 1, 0, 1, 1, 0, 1], 2)
         .addIndex([0, 1, 2, 0, 2, 3]);
      const shader = Shader.from(vert, frag, {
         iTime: Math.random() * 1_000_000,
         iResolution: [app.renderer.width, app.renderer.height, 1],
      });
      this.quad = this.addChild(new Mesh(quadGeometry, shader));
      this.onResize();
      G.pixi.ticker.add(() => {
         shader.uniforms.iTime += G.pixi.ticker.elapsedMS / 1000;
      });
      G.pixi.renderer.on("resize", this.onResize, this);
   }

   playParticle(texture: Texture | undefined, from: IHaveXY, target: IHaveXY, count: number): void {
      for (let i = 0; i < count; i++) {
         const particle = this.addChild(new Sprite(texture));
         particle.anchor.set(0.5, 0.5);
         particle.scale.set(0.1);
         particle.position.set(from.x, from.y);
         sequence(
            to(
               particle,
               {
                  x: from.x + (Math.random() - 0.5) * 100,
                  y: from.y + (Math.random() - 0.5) * 100,
                  scale: { x: 1, y: 1 },
               },
               0.5 + 0.1 * i,
               Easing.OutQuad,
            ),
            to(particle, { x: target.x, y: target.y, alpha: 0.5 }, 1 * (1 + Math.random() * 0.25), Easing.InOutQuad),
            runFunc(() => {
               particle.destroy();
            }),
         ).start();
      }
   }

   onResize() {
      const app = G.pixi;
      this.quad.shader.uniforms.iResolution = [app.renderer.width, app.renderer.height, 1];
      this.quad.width = app.renderer.width;
      this.quad.height = app.renderer.height;
      this.quad.x = app.renderer.width / 2;
      this.quad.y = app.renderer.height / 2;
   }

   override destroy(options?: IDestroyOptions | boolean): void {
      super.destroy(options);
   }
}
