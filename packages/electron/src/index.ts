import { init, type Client } from "@fishpondstudio/steamworks.js";
import { BrowserWindow, Menu, app, dialog, ipcMain } from "electron";
import { ensureDirSync, existsSync, renameSync } from "fs-extra";
import path from "node:path";
import { IPCService } from "./IPCService";

export type SteamClient = Omit<Client, "init" | "runCallbacks">;

app.commandLine.appendSwitch("enable-logging", "file");

ensureDirSync(getLocalGameSavePath());
ensureDirSync(getGameSavePath());

const logPath = path.join(getLocalGameSavePath(), "SpaceshipIdle.log");
if (existsSync(logPath)) {
   renameSync(logPath, path.join(getLocalGameSavePath(), "SpaceshipIdle-prev.log"));
}

app.commandLine.appendSwitch("log-file", logPath);
app.commandLine.appendSwitch("enable-experimental-web-platform-features");

export function getGameSavePath(): string {
   return path.join(app.getPath("appData"), "SpaceshipIdleSaves");
}

export function getLocalGameSavePath(): string {
   return path.join(app.getPath("appData"), "SpaceshipIdleLocal");
}

export const MIN_WIDTH = 1136;
export const MIN_HEIGHT = 640;

const createWindow = async () => {
   try {
      const steam = init();

      // if (app.isPackaged && steam.apps.currentBetaName() !== "beta") {
      //    dialog.showErrorBox(
      //       "Switch To Beta Branch",
      //       "Play testing requires switching to the beta branch on Steam first",
      //    );
      //    quit();
      // }

      const mainWindow = new BrowserWindow({
         webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: !app.isPackaged,
            backgroundThrottling: false,
         },
         minHeight: MIN_HEIGHT,
         minWidth: MIN_WIDTH,
         show: false,
         backgroundColor: "#000000",
      });

      if (app.isPackaged) {
         mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
      } else {
         mainWindow.loadURL("http://localhost:4173/");
         mainWindow.webContents.openDevTools();
      }

      mainWindow.removeMenu();
      mainWindow.maximize();
      mainWindow.show();

      if (steam.utils.isSteamRunningOnSteamDeck()) {
         mainWindow.setFullScreen(true);
      }

      mainWindow.on("close", (e) => {
         e.preventDefault();
         mainWindow.webContents.send("close");
      });

      const service = new IPCService(steam);

      ipcMain.handle("__RPCCall", (e, method: keyof IPCService, args) => {
         // @ts-expect-error
         return service[method].apply(service, args);
      });
   } catch (error) {
      dialog.showErrorBox("Failed to Start Game", String(error));
      quit();
   }
};

Menu.setApplicationMenu(null);

app.on("ready", createWindow);

app.on("window-all-closed", () => {
   quit();
});

function quit() {
   app.quit();
}
