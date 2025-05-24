import type { GameState } from "../game/GameState";
import type { ChatLanguage } from "../game/Languages";
import type { CountryCode } from "../utils/CountryCode";
import type { IChat, IShip } from "./ServerMessageTypes";

export interface IServer {
   changePlayerHandle: (name: string) => Promise<void>;
   saveShip: (ship: GameState, score: number) => Promise<void>;
   listShips: (limit: number, offset: number) => Promise<{ total: number; ships: IShip[] }>;
   viewShip: (id: string) => Promise<IShip>;
   deleteShip: (id: string) => Promise<void>;
   setBaseline: (id: string) => Promise<void>;
   findShip: (quantum: number, range: [number, number]) => Promise<IShip>;
   sendChat: (message: string, channel: ChatLanguage, country: keyof typeof CountryCode) => Promise<void>;
   getChatByChannel: (channel: ChatLanguage) => Promise<IChat[]>;
}
