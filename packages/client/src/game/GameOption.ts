import type { Building } from "@spaceship-idle/shared/src/game/definitions/Buildings";
import type { Languages } from "@spaceship-idle/shared/src/game/Languages";
import type { VideoTutorial } from "@spaceship-idle/shared/src/game/logic/VideoTutorials";
import type { IShortcutConfig, Shortcut } from "@spaceship-idle/shared/src/game/Shortcut";
import type { CountryCode } from "@spaceship-idle/shared/src/utils/CountryCode";
import type { ValueOf } from "@spaceship-idle/shared/src/utils/Helper";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";

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
   ShowAmmoPerSec: 1 << 9,
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
   buildingColors: Map<Building, number> = new Map();
   flag: GameOptionFlag = GameOptionFlag.ShowResources | GameOptionFlag.TheoreticalValue | GameOptionFlag.RetroFilter;
   nebulaStrength = 0.5;
   volume = 1;
   shortcuts = DefaultShortcuts;
   videoTutorials: Set<VideoTutorial> = new Set();
}

export const GameOptionUpdated = new TypedEvent<void>();
