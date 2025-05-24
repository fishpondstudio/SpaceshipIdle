import type { CountryCode } from "../utils/CountryCode";
import type { ValueOf } from "../utils/Helper";
import { TypedEvent } from "../utils/TypedEvent";
import type { ElementChoice } from "./GameState";
import type { Languages } from "./Languages";
import type { ElementSymbol } from "./PeriodicTable";
import type { Building } from "./definitions/Buildings";

export const GameOptionFlag = {
   None: 0,
   TheoreticalValue: 1 << 0,
   ShowResources: 1 << 1,
   RetroFilter: 1 << 2,
   TutorialDone: 1 << 3,
};

export type GameOptionFlag = ValueOf<typeof GameOptionFlag>;

export interface Inventory {
   amount: number;
   level: number;
}

export class GameOption {
   country: keyof typeof CountryCode = "EARTH";
   chatLanguages: Set<keyof typeof Languages> = new Set(["en"]);
   language: keyof typeof Languages = "en";
   buildingColors: Map<Building, number> = new Map();
   flag: GameOptionFlag = GameOptionFlag.ShowResources | GameOptionFlag.RetroFilter;
   elements = new Map<ElementSymbol, Inventory>();
   elementChoices: ElementChoice[] = [];
   volume = 1;
}

export const GameOptionUpdated = new TypedEvent<void>();
