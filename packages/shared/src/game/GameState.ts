import { wyhash_str } from "../thirdparty/wyhash";
import { createTile, randomAlphaNumeric, type Tile, uuid4 } from "../utils/Helper";
import { jsonEncode } from "../utils/Serialization";
import { TypedEvent } from "../utils/TypedEvent";
import type { Addon } from "./definitions/Addons";
import { Boost } from "./definitions/Boosts";
import type { Catalyst, CatalystCat } from "./definitions/Catalyst";
import type { Galaxy } from "./definitions/Galaxy";
import type { Resource } from "./definitions/Resource";
import type { ShipClass } from "./definitions/ShipClass";
import type { ShipDesign } from "./definitions/ShipDesign";
import type { Stat } from "./definitions/Stat";
import type { Tech } from "./definitions/TechDefinitions";
import { GameOption } from "./GameOption";
import { MaxX, MaxY } from "./Grid";
import { type ITileData, makeTile } from "./ITileData";
import type { AlertType } from "./logic/AlertLogic";
import { rollCatalyst } from "./logic/CatalystLogic";
import type { ElementSymbol } from "./PeriodicTable";

export type Tiles = Map<Tile, ITileData>;

export const GameStateFlags = {
   None: 0,
   Incompatible: 1 << 0,
   ShowTutorial: 1 << 1,
} as const;

export type GameStateFlags = (typeof GameStateFlags)[keyof typeof GameStateFlags];

export interface ResourceDataPersisted {
   total: number;
   used: number;
}

export interface ResourceData extends ResourceDataPersisted {
   current: number;
}

export class GameState {
   id = uuid4();
   seed = randomAlphaNumeric(32);
   tiles: Tiles = new Map();
   resources = new Map<Resource, ResourceDataPersisted>();
   stats = new Map<Stat, number>();
   unlockedTech = new Set<Tech>();
   elements = new Map<ElementSymbol, ElementData>();
   permanentElements = new Map<ElementSymbol, ElementData>();
   selectedCatalysts = new Map<CatalystCat, Catalyst>();
   selectedDirectives = new Map<ShipClass, Boost>();
   addons = new Map<Addon, { tile: Tile | null; amount: number }>();
   name = "Unnamed";
   shipDesign: ShipDesign = "Ship1";
   flags: GameStateFlags = GameStateFlags.None;
   offlineTime = 0;
}

export class GameData {
   tick = 0;
   elementChoices: ElementChoice[] = [];
   permanentElementChoices: ElementChoice[] = [];
   catalystChoices = new Map<CatalystCat, Catalyst[]>([["C1", rollCatalyst("C1")]]);
   galaxy: Galaxy = { starSystems: [] };
   alerts: { message: string; type: AlertType; time: number }[] = [];
}

export interface ElementData {
   damage: number;
   hp: number;
   amount: number;
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
   const x = MaxX / 2 - 2;
   state.tiles.set(createTile(x, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x, MaxY / 2 - 1), makeTile("MS1", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2 - 1), makeTile("MS1", 1));
   state.resources.set("Quantum", { total: 6, used: 6 });
   return state;
}

export class SaveGame {
   state: GameState = new GameState();
   data: GameData = new GameData();
   options: GameOption = new GameOption();
}

export const GameStateUpdated = new TypedEvent<void>();
