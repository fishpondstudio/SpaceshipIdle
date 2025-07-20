import { keysOf, shuffle, type Tile } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { Building } from "../definitions/Buildings";
import { Catalyst, CatalystCat, type ICatalystDefinition } from "../definitions/Catalyst";
import { CatalystPerCat } from "../definitions/Constant";
import type { GameState } from "../GameState";
import type { Multipliers } from "./IMultiplier";
import type { RuntimeTile } from "./RuntimeTile";

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

export function tickCatalyst(getter: (tile: Tile) => RuntimeTile | undefined, gs: GameState): void {
   const catalysts = new Map<Catalyst, { cat: CatalystCat; buildings: Set<Building>; tiles: Set<Tile> }>();
   gs.catalysts.forEach((data, cat) => {
      if (data.selected) {
         catalysts.set(data.selected, { cat, buildings: new Set(), tiles: new Set() });
      }
   });
   gs.tiles.forEach((tileData, tile) => {
      catalysts.forEach((set, catalyst) => {
         const def = Catalyst[catalyst];
         if (def.filter(tileData.type)) {
            set.buildings.add(tileData.type);
            set.tiles.add(tile);
         }
      });
   });
   catalysts.forEach((data, catalyst) => {
      const def = Catalyst[catalyst];
      if (data.buildings.size >= def.amount) {
         data.tiles.forEach((tile) => {
            const rs = getter(tile);
            if (rs) {
               if ("hp" in def.multipliers) {
                  rs.hpMultiplier.add(def.multipliers.hp, t(L.CatXCatalystSource, CatalystCat[data.cat].name()));
               }
               if ("damage" in def.multipliers) {
                  rs.damageMultiplier.add(
                     def.multipliers.damage,
                     t(L.CatXCatalystSource, CatalystCat[data.cat].name()),
                  );
               }
            }
         });
      }
   });
}
