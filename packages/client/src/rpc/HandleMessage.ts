import {
   MessageType,
   UserFlags,
   type AllMessageTypes,
   type IChat,
   type IChatMessage,
   type IRPCMessage,
   type IUser,
   type IWelcomeMessage,
} from "@spaceship-idle/shared/src/rpc/ServerMessageTypes";
import { hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { msgpackDecode } from "@spaceship-idle/shared/src/utils/Serialization";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import { G } from "../utils/Global";
import { makeObservableHook } from "../utils/Hook";
import { handleRpcResponse } from "./HandleRpcResponse";
import { SESSION_KEY } from "./RPCClient";

let serverTimeOffset = 0;
let user: IUser | null = null;

export function serverNow(): number {
   return Date.now() + serverTimeOffset;
}

export function isConnected(): boolean {
   return user !== null;
}

export function onDisconnected(): void {
   user = null;
   OnConnectionChanged.emit(false);
}

export function getUser(): IUser | null {
   return user;
}

export function isAdmin(): boolean {
   return hasFlag(user?.json.flags ?? UserFlags.None, UserFlags.Admin);
}

export const UserUpdated = new TypedEvent<IUser>();
export const OnChatMessage = new TypedEvent<IChat[]>();
export const OnConnectionChanged = new TypedEvent<boolean>();
export const useConnected = makeObservableHook<boolean, void>(OnConnectionChanged, isConnected);

export function handleMessage(e: MessageEvent<any>) {
   const message = msgpackDecode<AllMessageTypes>(e.data);
   const type = message.type as MessageType;
   switch (type) {
      case MessageType.RPC: {
         const r = message as IRPCMessage;
         handleRpcResponse(r.data);
         break;
      }
      case MessageType.Welcome: {
         const w = message as IWelcomeMessage;
         user = w.user;
         serverTimeOffset = w.time - Date.now();
         sessionStorage.setItem(SESSION_KEY, w.session);
         console.log("[Welcome]", w);
         console.log(
            `[Server Time] Server Now: ${w.time}, Client Now = ${Date.now()}, Offset = ${serverTimeOffset}, Adjusted = ${serverNow()}`,
         );
         G.save.current.offlineTime += w.offlineTime;
         UserUpdated.emit(user);
         OnConnectionChanged.emit(true);
         break;
      }
      case MessageType.Chat: {
         const c = message as IChatMessage;
         OnChatMessage.emit([c.chat]);
         break;
      }
   }
}
