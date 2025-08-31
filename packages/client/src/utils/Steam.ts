import type { IPCService } from "@spaceship-idle/electron/src/IPCService";
import { showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { rpcClient } from "@spaceship-idle/shared/src/thirdparty/TRPCClient";
import { saveGame } from "../game/LoadSave";
import { playError } from "../ui/Sound";
import { G } from "./Global";

export function isSteam(): boolean {
   return typeof IPCBridge !== "undefined";
}

export const SteamClient = rpcClient<IPCService>({
   request: (method: string, params: any[]) => {
      if (!IPCBridge) {
         throw new Error("SteamClient is not defined");
      }
      return IPCBridge.rpcCall(method, params);
   },
});

if (typeof IPCBridge !== "undefined") {
   IPCBridge.onClose(() => {
      saveGame(G.save)
         .then(() => SteamClient.quit())
         .catch((e) => {
            playError();
            showError(String(e));
         });
   });
}
