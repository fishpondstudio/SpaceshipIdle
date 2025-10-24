import { entriesOf, forEach, shuffle, type Tile } from "../../utils/Helper";
import type { IHaveXY } from "../../utils/Vector2";
import { abilityTarget } from "../definitions/Ability";
import { type Addon, AddonCraftRecipe, AddonRequirementFunc, Addons, getAddonEffect } from "../definitions/Addons";
import type { Blueprint } from "../definitions/Blueprints";
import { type ShipClass, ShipClassList } from "../definitions/ShipClass";
import type { GameState } from "../GameState";
import { RequestParticle } from "./RequestParticle";
import type { Runtime } from "./Runtime";
import { getShipClass } from "./TechLogic";

export function tickAddon(gs: GameState, rt: Runtime): void {
   const addonTiles = new Set<Tile>();
   for (const [addon, data] of gs.addons) {
      if (!data.tile) {
         continue;
      }
      const equippedRs = rt.get(data.tile);
      if (!equippedRs) {
         continue;
      }
      addonTiles.add(data.tile);
      if (!equippedRs.addon) {
         equippedRs.addon = { type: addon, tick: 0, conditionalTargets: 0 };
      } else {
         equippedRs.addon.tick++;
      }
      const def = Addons[addon];
      if (equippedRs.addon.tick >= def.cooldown) {
         equippedRs.addon.tick = 0;
         equippedRs.addon.conditionalTargets = 0;
         def.effect(def, getAddonEffect(data.amount), equippedRs);
         const gs = rt.getGameState(data.tile);
         if (!gs) {
            return;
         }
         const { side, state } = gs;
         abilityTarget(side, def.range, data.tile, state.tiles).forEach((target) => {
            if (target === data.tile) {
               return;
            }
            const targetRs = rt.get(target);
            if (targetRs && AddonRequirementFunc[def.requirement](targetRs, equippedRs)) {
               def.effect(def, getAddonEffect(data.amount), targetRs);
               if (equippedRs.addon) {
                  equippedRs.addon.conditionalTargets++;
               }
            }
         });
      }
   }
   gs.tiles.forEach((data, tile) => {
      const rs = rt.get(tile);
      if (rs && !addonTiles.has(tile)) {
         rs.addon = null;
      }
   });
}

export function rollAddon(gs: GameState): Addon | null {
   const shipClass = getShipClass(gs);
   const candidates: Addon[] = [];
   forEach(Addons, (addon, def) => {
      if (def.shipClass === shipClass) {
         candidates.push(addon);
      }
   });
   if (candidates.length === 0) {
      return null;
   }
   shuffle(candidates);
   return candidates[0];
}

export function hasUnequippedAddon(gs: GameState): boolean {
   for (const data of gs.addons.values()) {
      if (data.amount > 0 && data.tile === null) {
         return true;
      }
   }
   return false;
}

export function getAddonsInClass(shipClass: ShipClass, blueprint: Blueprint): Addon[] {
   const candidates: Addon[] = [];
   forEach(Addons, (addon, def) => {
      if (def.shipClass === shipClass && (!def.blueprint || def.blueprint === blueprint)) {
         candidates.push(addon);
      }
   });
   return candidates;
}

export function getAddonsWithinClass(shipClass: ShipClass, blueprint: Blueprint): Addon[] {
   const candidates: Addon[] = [];
   forEach(Addons, (addon, def) => {
      if (
         ShipClassList.indexOf(def.shipClass) <= ShipClassList.indexOf(shipClass) &&
         (!def.blueprint || def.blueprint === blueprint)
      ) {
         candidates.push(addon);
      }
   });
   return candidates;
}

export function getReforgeCost(fromAddon: Addon, toAddon: Addon): number {
   if (fromAddon === toAddon) {
      return 0;
   }
   const fromShipClassIdx = ShipClassList.indexOf(Addons[fromAddon].shipClass);
   const toShipClassIdx = ShipClassList.indexOf(Addons[toAddon].shipClass);
   if (fromShipClassIdx > toShipClassIdx) {
      return 0;
   }
   return 2 ** (toShipClassIdx - fromShipClassIdx);
}

export function getReforgeVictoryPoint(fromAddon: Addon, gs: GameState): number {
   const fromShipClassIdx = ShipClassList.indexOf(Addons[fromAddon].shipClass);
   const toShipClassIdx = ShipClassList.indexOf(getShipClass(gs));
   return 2 ** (toShipClassIdx - fromShipClassIdx);
}

export function addAddon(addon: Addon, amount: number, gs: GameState, from?: IHaveXY): void {
   if (amount <= 0) {
      return;
   }
   const data = gs.addons.get(addon);
   if (data) {
      data.amount += amount;
   } else {
      gs.addons.set(addon, { amount: amount, tile: null });
   }
   if (from) {
      RequestParticle.emit({ from, addon, amount });
   }
}

export function deductAddon(addon: Addon, amount: number, gs: GameState): void {
   if (amount <= 0) {
      return;
   }
   const data = gs.addons.get(addon);
   if (data) {
      data.amount -= amount;
      if (data.amount <= 0) {
         gs.addons.delete(addon);
      }
      if (data.amount < 0) {
         console.error("Negative addon amount, check whether there's enough addons before deducting!");
      }
   } else {
      console.error("Trying to deduct undiscovered addon(s), check whether there's an addon before deducting!");
   }
}

export function canCraftAddon(addon: Addon, gs: GameState): boolean {
   const recipe = AddonCraftRecipe[addon];
   if (!recipe) {
      return false;
   }
   for (const [addon, count] of entriesOf(recipe)) {
      if ((gs.addons.get(addon)?.amount ?? 0) < count) {
         return false;
      }
   }
   return true;
}

export function craftAddon(addon: Addon, gs: GameState): void {
   const recipe = AddonCraftRecipe[addon];
   if (!recipe) {
      return;
   }
   if (!canCraftAddon(addon, gs)) {
      return;
   }
   for (const [addon, count] of entriesOf(recipe)) {
      deductAddon(addon, count, gs);
   }
   addAddon(addon, 1, gs);
}
