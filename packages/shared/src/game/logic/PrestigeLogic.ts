import { shuffle } from "../../utils/Helper";
import { DefaultElementChoices } from "../definitions/Constant";
import type { GameOption } from "../GameOption";
import { GameState, initGameState, type SaveGame } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { getUnlockedElements, shardsFromShipValue } from "./ElementLogic";

export function prestige(save: SaveGame): void {
   for (const [element, amount] of save.current.elements) {
      addElementShard(save.options, element, amount);
   }
   rollElementShards(save, shardsFromShipValue(save.current));
   save.current = new GameState();
   initGameState(save.current);
}

export function addElementShard(options: GameOption, element: ElementSymbol, amount: number): void {
   const inventory = options.elements.get(element);
   if (inventory) {
      inventory.amount += amount;
   } else {
      options.elements.set(element, { amount, level: 0 });
   }
}

export function rollElementShards(save: SaveGame, amount: number) {
   const candidates: ElementSymbol[] = [];

   for (let i = 0; i < amount; i++) {
      if (candidates.length < DefaultElementChoices) {
         getUnlockedElements(save.current, candidates);
         shuffle(candidates);
      }

      const choices: ElementSymbol[] = [];
      for (let j = 0; j < DefaultElementChoices; j++) {
         const element = candidates.pop();
         if (element) {
            choices.push(element);
         }
      }

      save.options.elementChoices.push({
         choices,
         stackSize: 1,
      });
   }
}
