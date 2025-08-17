import type { SaveGame } from "@spaceship-idle/shared/src/game/GameState";
import { Languages } from "@spaceship-idle/shared/src/game/Languages";
import type { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import type { ValueOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L } from "@spaceship-idle/shared/src/utils/i18n";
import { TypedEvent } from "@spaceship-idle/shared/src/utils/TypedEvent";
import type { Application, Texture } from "pixi.js";
import { UserUpdated } from "../rpc/HandleMessage";
import type { Starfield } from "../scenes/Starfield";
import type { SceneManager } from "./SceneManager";

export const ShipMode = {
   Peace: 0,
   Battle: 1,
} as const;

export type ShipMode = ValueOf<typeof ShipMode>;

export const G: IGlobals = {
   scene: null!,
   starfield: null!,
   textures: null!,
   atlasUrl: null!,
   pixi: null!,
   save: null!,
   runtime: null!,
   speed: 1,
};

export interface IGlobals {
   scene: SceneManager;
   starfield: Starfield;
   textures: Map<string, Texture>;
   atlasUrl: Map<string, string>;
   pixi: Application;
   save: SaveGame;
   runtime: Runtime;
   speed: number;
}

export const OnLanguageChanged = new TypedEvent<void>();

export function setLanguage(lang: keyof typeof Languages) {
   G.save.options.language = lang;
   Object.assign(L, Languages[lang]);
   OnLanguageChanged.emit();
}

UserUpdated.on((user) => {
   G.save.state.name = user.handle;
});
