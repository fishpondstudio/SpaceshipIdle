import { notifications } from "@mantine/notifications";
import * as Sentry from "@sentry/browser";
import { SentryDSN } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionUpdated } from "@spaceship-idle/shared/src/game/GameOption";
import { GameStateFlags, initGameState, SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { forEach, rejectIn, setFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { Assets, BitmapFont, SCALE_MODES, type Spritesheet, type TextStyleFontWeight, type Texture } from "pixi.js";
import { FontFaces, Fonts } from "./assets";
import { checkBuildingTextures } from "./CheckBuildingTextures";
import { addDebugFunctions } from "./game/AddDebugFunctions";
import { loadGame, saveGame } from "./game/LoadSave";
import { showBootstrapModal } from "./game/ShowBootstrapModal";
import { getVersion } from "./game/Version";
import { startGameLoop } from "./GameLoop";
import { loadGameScene } from "./LoadGameScene";
import { migrateSave } from "./MigrateSave";
import { OnConnectionChanged } from "./rpc/HandleMessage";
import { connectWebSocket } from "./rpc/RPCClient";
import { Starfield } from "./scenes/Starfield";
import { subscribeToEvents } from "./SubscribeToEvents";
import { hideLoading } from "./ui/components/LoadingComp";
import { loadSounds } from "./ui/Sound";
import { G, setLanguage } from "./utils/Global";
import { SceneManager } from "./utils/SceneManager";
import { isSteam } from "./utils/Steam";

export async function bootstrap(): Promise<void> {
   initErrorTracking();
   console.time("Load Assets");
   FontFaces.forEach((f) => document.fonts.add(f));
   await Promise.all([Assets.init({ manifest: "./manifest.json" }), ...FontFaces.map((f) => f.load())]);
   console.timeEnd("Load Assets");
   console.time("Load Font");
   FontFaces.forEach((f) => {
      BitmapFont.from(
         f.family + (f.weight === "normal" ? "" : "Bold"),
         Object.assign(
            {
               fill: "#ffffff",
               fontSize: 64,
               fontFamily: f.family,
               fontWeight: f.weight as TextStyleFontWeight,
            },
            f.family === Fonts.SpaceshipIdle
               ? {
                    dropShadow: true,
                    dropShadowAlpha: 0.75,
                    dropShadowColor: "#000000",
                    dropShadowAngle: Math.PI / 6,
                    dropShadowBlur: 0,
                    dropShadowDistance: 3,
                 }
               : {},
         ),
         { chars: BitmapFont.ASCII, resolution: 2, padding: 8 },
      );
   });
   console.timeEnd("Load Font");

   console.time("Load Sprites");
   const textures: Map<string, Texture> = new Map();
   const atlasUrl: Map<string, string> = new Map();

   const bundle = await Assets.load<Spritesheet>("atlas");
   forEach(bundle.textures, (path, texture) => {
      textures.set(String(path), texture);
      atlasUrl.set(String(path), bundle.data.meta.image!);
   });

   const pixelBundle = await Assets.load<Spritesheet>("pixel");
   forEach(pixelBundle.textures, (path, texture) => {
      textures.set(String(path), texture);
      atlasUrl.set(String(path), pixelBundle.data.meta.image!);
      texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
   });

   G.textures = textures;
   G.atlasUrl = atlasUrl;
   console.timeEnd("Load Sprites");

   G.scene = new SceneManager({ app: G.pixi, textures });
   G.starfield = G.scene.root.addChild(new Starfield());

   let isNewPlayer = false;

   try {
      G.save = await loadGame();
   } catch (error) {
      isNewPlayer = true;
      G.save = new SaveGame();
      initGameState(G.save.state);
      G.save.state.flags = setFlag(G.save.state.flags, GameStateFlags.ShowTutorial);
   }
   migrateSave(G.save);
   setLanguage(G.save.options.language);
   subscribeToEvents();
   loadSounds();
   addDebugFunctions();
   checkBuildingTextures();
   connectWebSocket();
   try {
      await Promise.race([OnConnectionChanged.toPromise((connected) => connected), rejectIn(10)]);
   } catch (error) {
      console.error(error);
      notifications.show({
         message: String(error),
         position: "top-center",
         color: "red",
         withBorder: true,
      });
   }
   loadGameScene();
   startGameLoop();
   GameOptionUpdated.emit();
   showBootstrapModal(G.save, isNewPlayer);
   hideLoading();
   setInterval(() => saveGame(G.save), isSteam() ? 60_000 : 10_000);
}

function initErrorTracking(): void {
   if (import.meta.env.DEV) {
      return;
   }
   Sentry.init({
      dsn: SentryDSN,
      sendDefaultPii: true,
      release: getVersion(),
   });
}
