import type { IPCService } from "@spaceship-idle/electron/src/IPCService";
import { rpcClient } from "@spaceship-idle/shared/src/thirdparty/TRPCClient";

export function isSteam(): boolean {
   return typeof IPCBridge !== "undefined";
}

export const SteamClient = rpcClient<IPCService>({
   request: (method: string, params: any[]) => {
      if (typeof IPCBridge === "undefined") {
         throw new Error("SteamClient is not defined");
      }
      return IPCBridge.rpcCall(method, params);
   },
});

export function onSteamClose(callback: () => void): void {
   if (typeof IPCBridge !== "undefined") {
      IPCBridge.onClose(callback);
   }
}

window.addEventListener("DOMContentLoaded", () => {
   onSteamClose(() => {
      SteamClient.quit();
   });
});

export function openUrl(url: string): void {
   if (isSteam()) {
      SteamClient.openUrl(url);
      return;
   }
   window.open(url, "_blank");
}
