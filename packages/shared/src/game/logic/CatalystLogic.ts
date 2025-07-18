import { L, t } from "../../utils/i18n";
import type { ICatalystDefinition } from "../definitions/Catalyst";
import type { GameState } from "../GameState";
import type { Multipliers } from "./IMultiplier";

export function tickCatalyst(gs: GameState): void {}

export function getRequirement(def: ICatalystDefinition): string {
   return t(L.CatalystBuildXDifferentY, def.amount, def.trait());
}

export function getEffect(def: ICatalystDefinition): string {
   const multipliers = Object.entries(def.multipliers).map(([key_, value]) => {
      const key = key_ as keyof Multipliers;
      switch (key) {
         case "damage":
            return t(L.CatalystDamageMultiplier, value);
         case "hp":
            return t(L.CatalystHPMultiplier, value);
      }
   });
   return `${t(L.CatalystAllXGet, def.trait())} ${multipliers.join(", ")}`;
}
