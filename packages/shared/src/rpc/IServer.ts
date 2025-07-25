import type { GameState } from "../game/GameState";
import type { Language } from "../game/Languages";
import type { CountryCode } from "../utils/CountryCode";
import type { IChat, IShip } from "./ServerMessageTypes";

export interface IServer {
   changePlayerHandle: (name: string) => Promise<void>;
   saveShipV2: (ship: GameState) => Promise<string>;
   listShips: (limit: number, offset: number) => Promise<{ total: number; ships: IShip[] }>;
   viewShip: (id: string) => Promise<IShip>;
   deleteShip: (id: string) => Promise<void>;
   findShip: (quantum: number) => Promise<IShip>;
   findShipV2: (quantum: number, score: number) => Promise<IShip>;
   findShipV3: (
      hash: bigint,
      quantum: [number, number],
      score: [number, number],
      hp: [number, number],
      dps: [number, number],
   ) => Promise<IShip>;
   rankShips: (quantum: number, count: number) => Promise<IShip[]>;
   sendChat: (message: string, channel: Language, country: keyof typeof CountryCode) => Promise<void>;
   sendCommand: (command: string) => Promise<string>;
   getChatByChannel: (channel: Language) => Promise<IChat[]>;
}
