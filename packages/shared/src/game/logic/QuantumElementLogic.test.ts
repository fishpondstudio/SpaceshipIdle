import { expect, test } from "vitest";
import { GameState } from "../GameState";
import { getElementEffectiveLevel, getElementsInShipClass, getShipClassElementLevel } from "./QuantumElementLogic";

test("getElementEffectiveLevel", () => {
   expect(getElementEffectiveLevel(1)).toBe(1);
   expect(getElementEffectiveLevel(2)).toBe(1);
   expect(getElementEffectiveLevel(3)).toBe(2);
   expect(getElementEffectiveLevel(4)).toBe(2);
   expect(getElementEffectiveLevel(5)).toBe(2);
   expect(getElementEffectiveLevel(6)).toBe(3);
   expect(getElementEffectiveLevel(11)).toBe(4);
   expect(getElementEffectiveLevel(19)).toBe(5);
});

test("getShipClassElementLevel", () => {
   const gs = new GameState();
   getElementsInShipClass("Skiff").forEach((symbol) => {
      gs.permanentElements.set(symbol, { amount: 0, hp: 3, damage: 3 });
   });
   expect(getShipClassElementLevel("Skiff", gs)).toBe(3);

   getElementsInShipClass("Skiff").forEach((symbol) => {
      gs.permanentElements.set(symbol, { amount: 0, hp: 3, damage: 4 });
   });
   expect(getShipClassElementLevel("Skiff", gs)).toBe(3);

   getElementsInShipClass("Skiff").forEach((symbol) => {
      gs.permanentElements.set(symbol, { amount: 0, hp: 3, damage: 5 });
   });
   expect(getShipClassElementLevel("Skiff", gs)).toBe(4);

   // C, Sc, N, O, Ti, V, F, Cr
   getElementsInShipClass("Skiff").forEach((symbol) => {
      if (symbol === "C" || symbol === "Sc" || symbol === "N" || symbol === "O") {
         gs.permanentElements.set(symbol, { amount: 0, hp: 7, damage: 7 });
      } else {
         gs.permanentElements.set(symbol, { amount: 0, hp: 0, damage: 0 });
      }
   });
   expect(getShipClassElementLevel("Skiff", gs)).toBe(4);
});
