import { wyhash_str } from "../thirdparty/wyhash";
import { createTile, uuid4, type Tile } from "../utils/Helper";
import { jsonEncode } from "../utils/Serialization";
import { TypedEvent } from "../utils/TypedEvent";
import type { Resource } from "./definitions/Resource";
import type { Tech } from "./definitions/TechDefinitions";
import { GameOption } from "./GameOption";
import { MaxX, MaxY } from "./Grid";
import { makeTile, type ITileData } from "./ITileData";
import { shipExtent } from "./logic/ShipLogic";
import type { ElementSymbol } from "./PeriodicTable";

export type Tiles = Map<Tile, ITileData>;

export const GameStateFlags = {
   None: 0,
   Prestige: 1 << 0,
   ShowTutorial: 1 << 1,
} as const;

export type GameStateFlags = (typeof GameStateFlags)[keyof typeof GameStateFlags];

export class GameState {
   id = uuid4();
   tiles: Tiles = new Map();
   resources = new Map<Resource, number>();
   unlockedTech = new Set<Tech>();
   battleCount = 0;
   trialCount = 0;
   elements = new Map<ElementSymbol, number>();
   discoveredElements = 0;
   elementChoices: ElementChoice[] = [];
   name = "Unnamed";
   flags: GameStateFlags = GameStateFlags.None;
   offlineTime = 0;
}

const HASH_SEED = BigInt(0xdeadbeef);

function toHashString(gs: GameState): string {
   return jsonEncode({
      tiles: Array.from(gs.tiles.entries()).sort((a, b) => a[0] - b[0]),
      unlockedTech: Array.from(gs.unlockedTech.values()).sort(),
      elements: Array.from(gs.elements.entries()).sort((a, b) => a[0].localeCompare(b[0])),
   });
}

export function hashGameState(gs: GameState): bigint {
   const json = toHashString(gs);
   return wyhash_str(json, HASH_SEED);
}

export function hashGameStatePair(gs1: GameState, gs2: GameState): bigint {
   const json1 = toHashString(gs1);
   const json2 = toHashString(gs2);
   const hash1 = wyhash_str(json1, HASH_SEED);
   const hash2 = wyhash_str(json2, HASH_SEED);
   return hash1 < hash2 ? wyhash_str(json1 + json2, HASH_SEED) : wyhash_str(json2 + json1, HASH_SEED);
}

export interface ElementChoice {
   choices: ElementSymbol[];
   stackSize: number;
}

export function initGameState(state: GameState): GameState {
   state.unlockedTech.add("A1");
   state.unlockedTech.add("B4");
   state.unlockedTech.add("B2");
   state.unlockedTech.add("B3");
   state.unlockedTech.add("C3");
   const ext = shipExtent(state);
   const x = MaxX / 2 - ext - 1;
   state.tiles.set(createTile(x, MaxY / 2), makeTile("SiCollector", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x, MaxY / 2 - 1), makeTile("TiCollector", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2 - 1), makeTile("SolarPower", 3));
   return state;
}

export class SaveGame {
   current: GameState = new GameState();
   options: GameOption = new GameOption();
}

export const GameStateUpdated = new TypedEvent<void>();
