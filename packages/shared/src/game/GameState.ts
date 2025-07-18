import { wyhash_str } from "../thirdparty/wyhash";
import { createTile, shuffle, type Tile, uuid4 } from "../utils/Helper";
import { jsonEncode } from "../utils/Serialization";
import { TypedEvent } from "../utils/TypedEvent";
import { type Catalyst, CatalystCat } from "./definitions/Catalyst";
import { CatalystPerCat } from "./definitions/Constant";
import type { Resource } from "./definitions/Resource";
import type { Tech } from "./definitions/TechDefinitions";
import { GameOption } from "./GameOption";
import { MaxX, MaxY } from "./Grid";
import { type ITileData, makeTile } from "./ITileData";
import { shipExtent } from "./logic/ShipLogic";
import type { ElementSymbol } from "./PeriodicTable";

export type Tiles = Map<Tile, ITileData>;

export const GameStateFlags = {
   None: 0,
   Incompatible: 1 << 0,
   ShowTutorial: 1 << 1,
   QualifierBattlePrompted: 1 << 2,
} as const;

export type GameStateFlags = (typeof GameStateFlags)[keyof typeof GameStateFlags];

export class GameState {
   id = uuid4();
   tiles: Tiles = new Map();
   resources = new Map<Resource, number>();
   unlockedTech = new Set<Tech>();
   win = 0;
   loss = 0;
   discoveredElements = 0;
   elements = new Map<ElementSymbol, number>();
   elementChoices: ElementChoice[] = [];
   permanentElements = new Map<ElementSymbol, PermanentElementData>();
   permanentElementChoices: ElementChoice[] = [];
   catalysts = new Map<CatalystCat, { choices: Catalyst[]; selected: Catalyst | null }>([
      ["C1", { choices: shuffle(CatalystCat.C1.slice(0)).slice(0, CatalystPerCat), selected: null }],
   ]);
   name = "Unnamed";
   flags: GameStateFlags = GameStateFlags.None;
   offlineTime = 0;
}

export interface Inventory {
   amount: number;
   level: number;
}

export interface PermanentElementData {
   amount: number;
   production: number;
   xp: number;
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
   state.unlockedTech.add("A2");
   const ext = shipExtent(state);
   const x = MaxX / 2 - ext - 1;
   state.tiles.set(createTile(x, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x, MaxY / 2 - 1), makeTile("MS1", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2 - 1), makeTile("MS1", 1));
   return state;
}

export class SaveGame {
   current: GameState = new GameState();
   options: GameOption = new GameOption();
}

export const GameStateUpdated = new TypedEvent<void>();
