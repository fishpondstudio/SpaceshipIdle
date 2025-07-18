import { keysOf, shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { type Catalyst, CatalystCat, type ICatalystDefinition } from "../definitions/Catalyst";
import { CatalystPerCat } from "../definitions/Constant";
import type { Multipliers } from "./IMultiplier";

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

export function getNextCatalystCat(cat: CatalystCat): CatalystCat | null {
   const keys = keysOf(CatalystCat);
   const idx = keys.indexOf(cat);
   if (idx === -1) return null;
   if (idx === keys.length - 1) return null;
   return keys[idx + 1] as CatalystCat;
}

export function rollCatalyst(cat: CatalystCat): Catalyst[] {
   return shuffle(CatalystCat[cat].candidates.slice(0)).slice(0, CatalystPerCat);
}
