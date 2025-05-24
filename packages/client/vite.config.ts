import { AssetPack } from "@assetpack/core";
import { pixiPipes } from "@assetpack/core/pixi";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
   return {
      base: "",
      plugins: [react(), assetpackPlugin()],
   };
});
function assetpackPlugin(): Plugin {
   const apConfig = {
      entry: "./textures",
      output: "./public",
      pipes: [
         ...pixiPipes({
            cacheBust: false,
            compression: { png: true, webp: false },
            texturePacker: {
               texturePacker: {
                  nameStyle: "relative",
                  removeFileExtension: true,
                  allowTrim: false,
                  allowRotation: false,
               },
               resolutionOptions: { resolutions: { default: 1 }, fixedResolution: "default" },
            },
         }),
      ],
   };
   let mode: ResolvedConfig["command"];
   let ap: AssetPack | undefined;

   return {
      name: "vite-plugin-assetpack",
      configResolved(resolvedConfig) {
         mode = resolvedConfig.command;
         if (!resolvedConfig.publicDir) return;
         if (apConfig.output) return;
         const publicDir = resolvedConfig.publicDir.replace(process.cwd(), "");
         apConfig.output = `.${publicDir}/`;
      },
      buildStart: async () => {
         if (mode === "serve") {
            if (ap) return;
            ap = new AssetPack(apConfig);
            void ap.watch();
         } else {
            await new AssetPack(apConfig).run();
         }
      },
      buildEnd: async () => {
         if (ap) {
            await ap.stop();
            ap = undefined;
         }
      },
   };
}
