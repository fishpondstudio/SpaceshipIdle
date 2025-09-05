import { clamp, inverse, shuffle } from "../../utils/Helper";
import { Config } from "../Config";
import { DefaultElementChoices, QuantumToElement } from "../definitions/Constant";
import type { ElementData, GameState, SaveGame } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { fib, getUnlockedBuildings } from "./BuildingLogic";
import { addResource, changeStat, getStat, resourceOf } from "./ResourceLogic";
import { getShipBlueprint } from "./ShipLogic";

export function tickElement(save: SaveGame): void {
   const totalXP = resourceOf("XP", save.state.resources).total;
   const expectedQuantum = xpToQuantum(totalXP);
   const currentQuantum = resourceOf("Quantum", save.state.resources).total;
   if (currentQuantum < expectedQuantum) {
      addResource("Quantum", expectedQuantum - currentQuantum, save.state.resources);
   }
   const expectedElements = xpToElement(totalXP);
   const currentElements = getStat("Element", save.state.stats);
   if (currentElements < expectedElements) {
      changeStat("Element", expectedElements - currentElements, save.state.stats);
   }
   for (let i = currentElements; i < expectedElements; i++) {
      const candidates = getUnlockedElements(save.state);
      const choices = shuffle(candidates.slice(0, DefaultElementChoices * 2)).slice(0, DefaultElementChoices);
      if (choices.length >= DefaultElementChoices) {
         save.data.elementChoices.push({
            choices: choices,
            stackSize: 1,
         });
      }
   }
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

export const StartQuantum = 10;

export function getMinimumQuantumForBattle(gs: GameState): number {
   const bp = getShipBlueprint(gs);
   return bp.length;
}

export function getMinimumSpaceshipXPForBattle(gs: GameState): number {
   return quantumToXP(getMinimumQuantumForBattle(gs));
}

const qToSVLookup = new Map<number, number>();

function populateQuantumLookup() {
   if (qToSVLookup.size > 0) {
      return;
   }
   for (let q = 10_000; q >= 1; q--) {
      const sv = qToSV(q);
      qToSVLookup.set(q, sv);
   }
}

export function xpToQuantum(spaceshipValue: number): number {
   populateQuantumLookup();
   for (const [q, sv] of qToSVLookup) {
      if (spaceshipValue >= sv) {
         return clamp(q + StartQuantum, StartQuantum, Number.POSITIVE_INFINITY);
      }
   }
   return StartQuantum;
}

export function quantumToXP(quantum: number): number {
   populateQuantumLookup();
   if (quantum <= StartQuantum) {
      return 0;
   }
   return qToSVLookup.get(quantum - 10) ?? 0;
}

export function svToQ(sv: number): number {
   return inverse(qToSV, sv, 0, 1e30);
}

export function qToSV(quantum: number): number {
   const t = Math.log(clamp(quantum, 30, Number.POSITIVE_INFINITY));
   return quantum ** t * 10;
}

export function getUsedQuantum(gs: GameState): number {
   return gs.tiles.size + gs.unlockedTech.size;
}

export function elementToXP(element: number): number {
   const quantum = elementToQuantum(element);
   return quantumToXP(quantum);
}

export function elementToQuantum(element: number): number {
   return StartQuantum + element * QuantumToElement - 5;
}

export function quantumToElement(quantum: number): number {
   return Math.floor((quantum - 5) / QuantumToElement);
}

function xpToElement(xp: number): number {
   return quantumToElement(xpToQuantum(xp));
}

export function totalDiscoveredElements(save: SaveGame): number {
   let amount = 0;
   for (const choice of save.data.elementChoices) {
      amount += choice.stackSize;
   }
   for (const [symbol, data] of save.state.elements) {
      amount += data.amount;
      amount += data.hp;
      amount += data.damage;
   }
   return amount;
}

export function hasUnassignedElements(gs: GameState): boolean {
   for (const [symbol, data] of gs.elements) {
      if (data.amount > 0) {
         return true;
      }
   }
   return false;
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

export function canUpgradeElement(symbol: ElementSymbol, type: keyof ElementData, gs: GameState): boolean {
   const inventory = gs.permanentElements.get(symbol);
   if (!inventory) {
      return false;
   }
   return inventory.amount >= getElementUpgradeCost(inventory[type] + 1);
}

export function tryUpgradeElement(symbol: ElementSymbol, type: keyof ElementData, gs: GameState): boolean {
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

export function hasPermanentElementUpgrade(data: ElementData): boolean {
   return data.amount >= getElementUpgradeCost(data.hp + 1) || data.amount >= getElementUpgradeCost(data.damage + 1);
}

export function revertElementUpgrade(
   symbol: ElementSymbol,
   type: keyof Omit<ElementData, "amount">,
   gs: GameState,
): void {
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
      total += getTotalElementUpgradeCost(amount.hp);
      total += getTotalElementUpgradeCost(amount.damage);
      total += amount.amount;
   }
   return total;
}

export function getTotalElementKinds(gs: GameState): number {
   let total = 0;
   for (const [symbol, amount] of gs.permanentElements) {
      if (amount.amount > 0 || amount.hp > 0 || amount.damage > 0) {
         total += 1;
      }
   }
   return total;
}

export function getTotalElementLevels(gs: GameState): number {
   let total = 0;
   for (const [symbol, amount] of gs.permanentElements) {
      total += amount.hp;
      total += amount.damage;
   }
   return total;
}
