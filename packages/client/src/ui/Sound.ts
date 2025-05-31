import { sound } from "@pixi/sound";
import bling from "../assets/sounds/bling.mp3";
import click from "../assets/sounds/click.mp3";
import error from "../assets/sounds/error.mp3";
import upgrade from "../assets/sounds/upgrade.mp3";

import { G } from "../utils/Global";

export function loadSounds(): void {
   sound.add("click", click);
   sound.add("error", error);
   sound.add("upgrade", upgrade);
   sound.add("bling", bling);
}

export function playClick(): void {
   if (!G.save) return;
   sound.play("click", { volume: G.save.options.volume });
}

export function playError(): void {
   if (!G.save) return;
   sound.play("error", { volume: G.save.options.volume });
}

export function playUpgrade(): void {
   if (!G.save) return;
   sound.play("upgrade", { volume: G.save.options.volume });
}

export function playBling(): void {
   if (!G.save) return;
   sound.play("bling", { volume: G.save.options.volume });
}
