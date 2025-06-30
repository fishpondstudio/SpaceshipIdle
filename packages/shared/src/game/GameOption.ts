import type { CountryCode } from "../utils/CountryCode";
import type { ValueOf } from "../utils/Helper";
import { TypedEvent } from "../utils/TypedEvent";
import type { Languages } from "./Languages";
import type { IShortcutConfig, Shortcut } from "./Shortcut";
import type { Building } from "./definitions/Buildings";

export const GameOptionFlag = {
   None: 0,
   TheoreticalValue: 1 << 0,
   ShowResources: 1 << 1,
   RetroFilter: 1 << 2,
   TutorialDone: 1 << 3,
   HideSteamIcon: 1 << 4,
   HideDiscordIcon: 1 << 5,
   CooldownIndicatorOutsideBattle: 1 << 6,
   LinearCooldownIndicator: 1 << 7,
   HideInactiveResources: 1 << 8,
};

export type GameOptionFlag = ValueOf<typeof GameOptionFlag>;

export const DefaultShortcuts: Record<Shortcut, IShortcutConfig> = {
   Upgrade1: {
      key: "q",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Downgrade1: {
      key: "w",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Upgrade5: {
      key: "1",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Downgrade5: {
      key: "2",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Upgrade10: {
      key: "3",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Downgrade10: {
      key: "4",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   UpgradeMax: {
      key: "e",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Recycle: {
      key: "r",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Priority0: {
      key: "a",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Priority10: {
      key: "s",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Capacity0: {
      key: "d",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   Capacity100: {
      key: "f",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
   MatchCapacityToAmmoProduction: {
      key: "g",
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
   },
} as const;

export class GameOption {
   country: keyof typeof CountryCode = "EARTH";
   chatLanguages: Set<keyof typeof Languages> = new Set(["en"]);
   language: keyof typeof Languages = "en";
   buildingColors: Map<Building, number> = new Map();
   flag: GameOptionFlag = GameOptionFlag.ShowResources | GameOptionFlag.TheoreticalValue | GameOptionFlag.RetroFilter;
   nebulaStrength = 0.5;
   volume = 1;
   shortcuts = DefaultShortcuts;
}

export const GameOptionUpdated = new TypedEvent<void>();
