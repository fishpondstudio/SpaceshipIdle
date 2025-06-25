import { shuffle } from "../../utils/Helper";
import { DefaultElementChoices } from "../definitions/Constant";
import { GameState, initGameState, type SaveGame } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { getUnlockedElements, shardsFromShipValue } from "./ElementLogic";

export function prestige(save: SaveGame): void {
   for (const [element, amount] of save.current.elements) {
      addElementShard(save.current, element, amount);
   }
   rollElementShards(save.current, shardsFromShipValue(save.current));
   const old = save.current;
   save.current = new GameState();
   // Carry over
   save.current.resources.set("Warp", old.resources.get("Warp") ?? 0);
   save.current.permanentElements = old.permanentElements;
   save.current.permanentElementChoices = old.permanentElementChoices;

   initGameState(save.current);
}

export function addElementShard(gs: GameState, element: ElementSymbol, amount: number): void {
   const inventory = gs.permanentElements.get(element);
   if (inventory) {
      inventory.amount += amount;
   } else {
      gs.permanentElements.set(element, { amount, level: 0 });
   }
}

export function rollElementShards(gs: GameState, amount: number) {
   const candidates: ElementSymbol[] = [];

   for (let i = 0; i < amount; i++) {
      if (candidates.length < DefaultElementChoices) {
         getUnlockedElements(gs, candidates);
         shuffle(candidates);
      }

      const choices: ElementSymbol[] = [];
      for (let j = 0; j < DefaultElementChoices; j++) {
         const element = candidates.pop();
         if (element) {
            choices.push(element);
         }
      }

      gs.permanentElementChoices.push({
         choices,
         stackSize: 1,
      });
   }
}
