import { clamp, inverse, shuffle } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { Config } from "../Config";
import { DefaultElementChoices, QuantumToElement } from "../definitions/Constant";
import type { ShipClass } from "../definitions/ShipClass";
import type { ElementData, GameState, SaveGame } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { showInfo } from "./AlertLogic";
import { fib, getBuildingName } from "./BuildingLogic";
import { addResource, addStat, getStat, resourceOf } from "./ResourceLogic";
import { getBuildingsInShipClass, getShipClass } from "./TechLogic";

export function tickQuantumElementProgress(save: SaveGame, silent?: boolean): void {
   const totalXP = resourceOf("XP", save.state.resources).total;
   const expectedQuantum = xpToQuantum(totalXP);
   const quantum = resourceOf("Quantum", save.state.resources);
   if (quantum.total < expectedQuantum) {
      addResource("Quantum", expectedQuantum - quantum.total, save.state.resources);
   }
   if (quantum.used !== getUsedQuantum(save.state)) {
      console.error(`Used quantum mismatch: Resource: ${quantum.used}, Actual: ${getUsedQuantum(save.state)}`);
   }
   const expectedElements = xpToElement(totalXP);
   const currentElements = getStat("Element", save.state.stats);
   if (currentElements < expectedElements) {
      const elementsToAdd = expectedElements - currentElements;
      addStat("Element", elementsToAdd, save.state.stats);
      if (!silent) {
         showInfo(t(L.AlertDiscoveredElements, elementsToAdd, expectedElements), true, true);
      }
   }
   for (let i = currentElements; i < expectedElements; i++) {
      const candidates = shuffle(getElementsInShipClass(getShipClass(save.state))).slice(0, DefaultElementChoices);
      if (candidates.length >= DefaultElementChoices) {
         save.data.elementChoices.push({
            choices: candidates,
            stackSize: 1,
         });
      }
   }
}

export function getElementsInShipClass(shipClass: ShipClass, result?: ElementSymbol[]): ElementSymbol[] {
   result ??= [];
   for (const building of getBuildingsInShipClass(shipClass)) {
      const def = Config.Buildings[building];
      if (def.element) {
         result.push(def.element);
      }
   }
   Config.Elements.forEach((effect, element) => {
      if (typeof effect === "function") {
         result.push(element);
      }
   });
   return result;
}

export const StartQuantum = 10;
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

function svToQ(sv: number): number {
   return inverse(qToSV, sv, 0, 1e30);
}

function qToSV(quantum: number): number {
   const t = 2 + Math.log(clamp(quantum, 30, Number.POSITIVE_INFINITY)) ** 0.5;
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
      if (typeof Config.Elements.get(symbol) === "string" && data.amount > 0) {
         return true;
      }
   }
   return false;
}

export function hasUpgradeableElements(gs: GameState): boolean {
   for (const [symbol, data] of gs.permanentElements) {
      if (hasPermanentElementUpgrade(symbol, gs)) {
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

export function hasPermanentElementUpgrade(symbol: ElementSymbol, gs: GameState): boolean {
   const data = gs.permanentElements.get(symbol);
   if (!data) {
      return false;
   }
   const effect = Config.Elements.get(symbol);
   if (typeof effect === "string") {
      return data.amount >= getElementUpgradeCost(data.hp + 1) || data.amount >= getElementUpgradeCost(data.damage + 1);
   }
   return data.amount >= getElementUpgradeCost(data.hp + 1);
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

export function getElementDesc(symbol: ElementSymbol, value: number): string {
   const elementEffect = Config.Elements.get(symbol);
   if (!elementEffect) {
      return "";
   }
   if (typeof elementEffect === "function") {
      return elementEffect(value);
   }
   return t(L.HpOrDamageMultiplierForX, getBuildingName(elementEffect));
}
