import { shuffle } from "../../utils/Helper";
import { Config } from "../Config";
import { DefaultElementChoices, QuantumToElement } from "../definitions/Constant";
import type { GameState, PermanentElementData } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { fib, getUnlockedBuildings } from "./BuildingLogic";
import { calcSpaceshipXP, quantumToXP, resourceValueOf, StartQuantum, xpToQuantum } from "./ResourceLogic";

export function tickElement(gs: GameState): void {
   const expectedElements = xpToElement(calcSpaceshipXP(gs));
   while (gs.discoveredElements < expectedElements) {
      gs.discoveredElements++;
      const candidates = getUnlockedElements(gs);
      const choices = shuffle(candidates.slice(0, DefaultElementChoices * 2)).slice(0, DefaultElementChoices);
      if (choices.length >= DefaultElementChoices) {
         gs.elementChoices.push({
            choices: choices,
            stackSize: 1,
         });
      }
   }
}

export function shardsFromShipValue(gs: GameState): number {
   const totalValue = calcSpaceshipXP(gs) + resourceValueOf(gs.resources);
   const xp = Math.max(0, totalValue - elementToXP(gs.discoveredElements));
   return Math.max(0, xpToElement(xp));
}

export function getUnlockedElements(gs: GameState, result?: ElementSymbol[]): ElementSymbol[] {
   result ??= [];
   const buildings = getUnlockedBuildings(gs);
   for (const building of buildings) {
      const def = Config.Buildings[building];
      if (def.element) {
         result.push(def.element);
      }
   }
   return result;
}

export function elementToXP(element: number): number {
   const quantum = StartQuantum + element * QuantumToElement - 5;
   return quantumToXP(quantum);
}

export function xpToElement(xp: number): number {
   const quantum = xpToQuantum(xp);
   return Math.floor((quantum - 5) / QuantumToElement);
}

export function totalDiscoveredElements(gs: GameState): number {
   let amount = 0;
   for (const choice of gs.elementChoices) {
      amount += choice.stackSize;
   }
   for (const [symbol, amt] of gs.elements) {
      amount += amt;
   }
   return amount;
}

export function getElementUpgradeCost(upgradeTo: number): number {
   return fib(upgradeTo);
}

const _totalElementUpgradeCostTable = new Map<number, number>();

export function getTotalElementUpgradeCost(upgradeTo: number): number {
   const cached = _totalElementUpgradeCostTable.get(upgradeTo);
   if (cached !== undefined) {
      return cached;
   }
   let total = 0;
   for (let i = 1; i <= upgradeTo; i++) {
      total += getElementUpgradeCost(i);
   }
   _totalElementUpgradeCostTable.set(upgradeTo, total);
   return total;
}

export function canUpgradeElement(symbol: ElementSymbol, type: "production" | "xp", gs: GameState): boolean {
   const inventory = gs.permanentElements.get(symbol);
   if (!inventory) {
      return false;
   }
   return inventory.amount >= getElementUpgradeCost(inventory[type] + 1);
}

export function tryUpgradeElement(symbol: ElementSymbol, type: "production" | "xp", gs: GameState): boolean {
   const inventory = gs.permanentElements.get(symbol);
   if (!inventory) {
      return false;
   }
   if (!canUpgradeElement(symbol, type, gs)) {
      return false;
   }
   inventory.amount -= getElementUpgradeCost(inventory[type] + 1);
   inventory[type]++;
   return true;
}

export function hasPermanentElementUpgrade(data: PermanentElementData): boolean {
   return (
      data.amount >= getElementUpgradeCost(data.production + 1) || data.amount >= getElementUpgradeCost(data.xp + 1)
   );
}

export function revertElementUpgrade(symbol: ElementSymbol, type: "production" | "xp", gs: GameState): void {
   const inventory = gs.permanentElements.get(symbol);
   if (!inventory) {
      return;
   }
   const level = inventory[type];
   if (level <= 0) {
      return;
   }
   for (let i = 1; i <= level; i++) {
      inventory.amount += getElementUpgradeCost(i);
      inventory[type]--;
   }
}

export function getTotalElementShards(gs: GameState): number {
   let total = 0;
   for (const [symbol, amount] of gs.permanentElements) {
      total += getTotalElementUpgradeCost(amount.production);
      total += getTotalElementUpgradeCost(amount.xp);
      total += amount.amount;
   }
   return total;
}

export function getTotalElementKinds(gs: GameState): number {
   let total = 0;
   for (const [symbol, amount] of gs.permanentElements) {
      if (amount.amount > 0 || amount.production > 0 || amount.xp > 0) {
         total += 1;
      }
   }
   return total;
}

export function getTotalElementLevels(gs: GameState): number {
   let total = 0;
   for (const [symbol, amount] of gs.permanentElements) {
      total += amount.production;
      total += amount.xp;
   }
   return total;
}
