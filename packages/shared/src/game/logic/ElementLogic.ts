import { shuffle } from "../../utils/Helper";
import { Config } from "../Config";
import { DefaultElementChoices, QuantumToElement } from "../definitions/Constant";
import type { GameState } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { fib, getUnlockedBuildings } from "./BuildingLogic";
import { calcSpaceshipXP, getUsedQuantum, resourceValueOf, StartQuantum, xpToQuantum } from "./ResourceLogic";

export function tickElement(gs: GameState): void {
   const quantum = getUsedQuantum(gs);
   const expectedElements = quantumToElement(quantum);
   while (gs.discoveredElements < expectedElements) {
      gs.discoveredElements++;
      const candidates = getUnlockedElements(gs);
      candidates.sort((a, b) => {
         const buildingA = Config.Element.get(a);
         const buildingB = Config.Element.get(b);
         if (!buildingA || !buildingB) {
            return 0;
         }
         const tierA = Config.BuildingTier.get(buildingA);
         const tierB = Config.BuildingTier.get(buildingB);
         if (!tierA || !tierB) {
            return 0;
         }
         return tierB - tierA;
      });
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
   const quantum = Math.max(0, xpToQuantum(totalValue) - elementToQuantum(gs.discoveredElements));
   return Math.max(0, quantumToElement(quantum));
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

export function elementToQuantum(element: number): number {
   return StartQuantum + element * QuantumToElement - 5;
}

export function quantumToElement(quantum: number): number {
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

export function canUpgradeElement(symbol: ElementSymbol, gs: GameState): boolean {
   const inventory = gs.permanentElements.get(symbol);
   if (!inventory) {
      return false;
   }
   return inventory.amount >= getElementUpgradeCost(inventory.level + 1);
}

export function tryUpgradeElement(symbol: ElementSymbol, gs: GameState): boolean {
   const inventory = gs.permanentElements.get(symbol);
   if (!inventory) {
      return false;
   }
   if (!canUpgradeElement(symbol, gs)) {
      return false;
   }
   inventory.amount -= getElementUpgradeCost(inventory.level + 1);
   inventory.level++;
   return true;
}
