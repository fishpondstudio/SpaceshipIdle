import type { IServer } from "@spaceship-idle/shared/src/rpc/IServer";
import { ServerWSErrorCode } from "@spaceship-idle/shared/src/rpc/ServerWSErrorCode";
import { removeTrailingUndefs, rpcClient } from "@spaceship-idle/shared/src/thirdparty/TRPCClient";
import { SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { msgpackEncode } from "@spaceship-idle/shared/src/utils/Serialization";
import { getBuildNumber, getVersion } from "../game/Version";
import { handleMessage, onDisconnected } from "./HandleMessage";
import { isSteam, SteamClient } from "./SteamClient";

let requestId = 0;
let ws: WebSocket | null = null;
let reconnect = 0;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const rpcRequests: Record<number, { resolve: Function; reject: Function; time: number }> = {};

export const RPCClient = rpcClient<IServer>({
   request: (method: string, params: any[]) => {
      return new Promise((resolve, reject) => {
         if (!ws || ws.readyState !== WebSocket.OPEN) {
            return reject("WebSocket is not ready yet");
         }
         const id = ++requestId;
         const request = {
            jsonrpc: "2.0",
            id: id,
            method,
            params: removeTrailingUndefs(params),
         };
         ws.send(msgpackEncode(request));
         rpcRequests[id] = { resolve, reject, time: Date.now() };
      });
   },
});

export function getServerAddress(): string {
   if (import.meta.env.DEV) {
      const url = new URLSearchParams(window.location.search);
      return url.get("server") ?? "ws://localhost:8001";
   }
   return "wss://si.fishpondstudio.com";
}

export const SESSION_KEY = "spaceship-idle-session";

export async function connectWebSocket(): Promise<void> {
   const params: string[] = [`version=${getVersion()}`, `build=${getBuildNumber()}`, "checksum="];
   const session = sessionStorage.getItem(SESSION_KEY);

   if (session) {
      params.push(`session=${session}`);
   } else if (isSteam()) {
      params.push(
         `ticket=${await SteamClient.getAuthSessionTicket()}`,
         "platform=steam",
         `appId=${await SteamClient.getAppId()}`,
      );
   } else {
      params.push("ticket=none", "platform=web");
   }

   const url = `${getServerAddress()}/?${params.join("&")}`;
   console.log(`[WebSocket] Connecting to ${url}`);
   ws = new WebSocket(url);

   if (!ws) {
      throw new Error("Failed to initialize WebSocket");
   }

   ws.binaryType = "arraybuffer";

   ws.onopen = () => {
      reconnect = 0;
   };
   ws.onmessage = (e) => {
      handleMessage(e);
   };
   ws.onclose = (e) => {
      if (e.code === ServerWSErrorCode.SessionExpired) {
         sessionStorage.removeItem(SESSION_KEY);
      }
      reconnect++;
      console.log("[WebSocket] OnClose", e);
      onDisconnected();
      setTimeout(connectWebSocket, Math.min(Math.pow(2, reconnect++) * SECOND, 16 * SECOND));
   };
}
