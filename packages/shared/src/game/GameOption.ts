import type { CountryCode } from "../utils/CountryCode";
import { uuid4, type ValueOf } from "../utils/Helper";
import { TypedEvent } from "../utils/TypedEvent";
import { SaveFileVersion } from "./definitions/Constant";
import type { Languages } from "./Languages";
import type { VideoTutorial } from "./logic/VideoTutorials";
import type { IShortcutConfig, Shortcut } from "./Shortcut";

export const GameOptionFlag = {
   None: 0,
   AlwaysShowChat: 1 << 0,
   HideXPText: 1 << 1,
   RetroFilter: 1 << 2,
   TutorialDone: 1 << 3,
   HideSteamIcon: 1 << 4,
   HideDiscordIcon: 1 << 5,
   CooldownIndicatorOutsideBattle: 1 << 6,
   LinearCooldownIndicator: 1 << 7,
   DisableWeaponFireAnimation: 1 << 8,
   AddonGridView: 1 << 9,
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
} as const;

export class GameOption {
   country: keyof typeof CountryCode = "EARTH";
   chatLanguages: Set<keyof typeof Languages> = new Set(["en"]);
   language: keyof typeof Languages = "en";
   flag: GameOptionFlag = GameOptionFlag.RetroFilter;
   nebulaStrength = 0.5;
   volume = 1;
   shortcuts = DefaultShortcuts;
   videoTutorials: Set<VideoTutorial> = new Set();
   version = SaveFileVersion;
   build = 0;
   id = uuid4();
}

export const GameOptionUpdated = new TypedEvent<void>();
