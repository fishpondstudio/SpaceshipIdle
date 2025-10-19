import { wyhash_str } from "../thirdparty/wyhash";
import { createTile, randomAlphaNumeric, type Tile, uuid4 } from "../utils/Helper";
import { jsonEncode } from "../utils/Serialization";
import { TypedEvent } from "../utils/TypedEvent";
import type { Addon } from "./definitions/Addons";
import type { Augment } from "./definitions/Augments";
import type { Blueprint } from "./definitions/Blueprints";
import type { Bonus } from "./definitions/Bonus";
import type { Catalyst, CatalystCat } from "./definitions/Catalyst";
import type { Galaxy } from "./definitions/Galaxy";
import type { Resource } from "./definitions/Resource";
import type { ShipClass } from "./definitions/ShipClass";
import type { Stat } from "./definitions/Stat";
import type { Tech } from "./definitions/TechDefinitions";
import { GameOption } from "./GameOption";
import { MaxX, MaxY } from "./Grid";
import { type ITileData, makeTile } from "./ITileData";
import type { AlertType } from "./logic/AlertLogic";
import { generateGalaxy } from "./logic/GalaxyLogic";
import type { ElementSymbol } from "./PeriodicTable";

export type Tiles = Map<Tile, ITileData>;

export const GameStateFlags = {
   None: 0,
   Incompatible: 1 << 0,
   ShowTutorial: 1 << 1,
   UsedWarp: 1 << 2,
} as const;

export type GameStateFlags = (typeof GameStateFlags)[keyof typeof GameStateFlags];

export const StopWarpCondition = {
   Never: 0,
   Zero: 1,
   Minimum: 2,
} as const;

export type StopWarpCondition = (typeof StopWarpCondition)[keyof typeof StopWarpCondition];

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
   resources = new Map<Resource, ResourceDataPersisted>();
   stats = new Map<Stat, number>();

   // Start of hashed properties
   // !IMPORTANT: If you change hashed properties, you must also change `toHashString` below!
   tiles: Tiles = new Map();
   unlockedTech = new Set<Tech>();
   elements = new Map<ElementSymbol, ElementData>();
   permanentElements = new Map<ElementSymbol, ElementData>();
   selectedCatalysts = new Map<CatalystCat, Catalyst>();
   selectedDirectives = new Map<ShipClass, Bonus>();
   augments = new Map<Augment, number>();
   addons = new Map<Addon, { tile: Tile | null; amount: number }>();
   blueprint: Blueprint = "Odyssey";
   // End of hashed properties

   name = "Unnamed";
   flags: GameStateFlags = GameStateFlags.None;
   offlineTime = 0;
}

function toHashString(gs: GameState): string {
   return jsonEncode({
      tiles: Array.from(gs.tiles.entries()).sort((a, b) => a[0] - b[0]),
      unlockedTech: Array.from(gs.unlockedTech.values()).sort(),
      elements: Array.from(gs.elements.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      permanentElements: Array.from(gs.permanentElements.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      selectedCatalysts: Array.from(gs.selectedCatalysts.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      selectedDirectives: Array.from(gs.selectedDirectives.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      augments: Array.from(gs.augments.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      addons: Array.from(gs.addons.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      blueprint: gs.blueprint,
   });
}

export class GameData {
   tick = 0;
   seconds = 0;
   elementChoices: ElementChoice[] = [];
   permanentElementChoices: ElementChoice[] = [];
   stopWarpCondition: StopWarpCondition = StopWarpCondition.Never;
   battledShips = new Set<bigint>();
   galaxy: Galaxy = { starSystems: [] };
   alerts: { message: string; type: AlertType; time: number; tick: number }[] = [];
}

export interface ElementData {
   damage: number;
   hp: number;
   amount: number;
}

const HASH_SEED = BigInt(0xdeadbeef);

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

export function initSaveGame(save: SaveGame): SaveGame {
   const state = save.state;
   state.unlockedTech.add("A1");
   state.unlockedTech.add("A2");
   const x = MaxX / 2 - 2;
   state.tiles.set(createTile(x, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2), makeTile("AC30", 1));
   state.tiles.set(createTile(x, MaxY / 2 - 1), makeTile("MS1", 1));
   state.tiles.set(createTile(x - 1, MaxY / 2 - 1), makeTile("MS1", 1));
   state.resources.set("Quantum", { total: 6, used: 6 });

   save.data.galaxy = generateGalaxy(Math.random);
   return save;
}

export class SaveGame {
   state: GameState = new GameState();
   data: GameData = new GameData();
   options: GameOption = new GameOption();
}

export const GameStateUpdated = new TypedEvent<void>();
