import type { GameState } from "../game/GameState";
import type { Language } from "../game/Languages";
import type { CountryCode } from "../utils/CountryCode";
import type { ValueOf } from "../utils/Helper";

export enum MessageType {
   RPC = 0,
   Welcome = 1,
   Chat = 2,
}

export type AllMessageTypes = IRPCMessage | IWelcomeMessage | IChatMessage;

export interface IMessage {
   type: MessageType;
}

export interface IRPCMessage extends IMessage {
   type: MessageType.RPC;
   data: any;
}

export interface IWelcomeMessage extends IMessage {
   type: MessageType.Welcome;
   time: number;
   offlineTime: number;
   user: IUser;
   session: string;
}

export interface IChatMessage extends IMessage {
   type: MessageType.Chat;
   chat: IChat;
}

export interface IUser {
   handle: string;
   platformId: string;
   json: IUserJson;
}

export interface IShip {
   shipId: string;
   userId: string;
   quantum: number;
   score: number;
   hp: number;
   dps: number;
   version: number;
   json: GameState;
}

export interface IUserJson {
   flags: UserFlags;
   lastDisconnectedAt: number;
   createdAt: number;
}

export const UserFlags = {
   None: 0,
   Admin: 1 << 0,
   Mod: 1 << 1,
   Banned: 1 << 2,
   Muted: 1 << 3,
   NoRename: 1 << 4,
} as const;

export type UserFlags = ValueOf<typeof UserFlags>;

export interface IChat {
   name: string;
   message: string;
   time: number;
   country: keyof typeof CountryCode;
   flag: ChatFlag;
   channel: Language;
}

export const ChatFlag = {
   None: 0,
   Moderator: 1 << 0,
} as const;

export type ChatFlag = ValueOf<typeof ChatFlag>;
