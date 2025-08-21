import { shuffle } from "../../utils/Helper";
import { DefaultElementChoices } from "../definitions/Constant";
import { GameState, initGameState, type SaveGame } from "../GameState";
import type { ElementSymbol } from "../PeriodicTable";
import { getUnlockedElements, shardsFromShipValue } from "./ElementLogic";
import { addResource, resourceOf } from "./ResourceLogic";

export function prestige(save: SaveGame): void {
   for (const [element, amount] of save.state.elements) {
      addElementShard(save.state, element, amount.hp);
      addElementShard(save.state, element, amount.damage);
      addElementShard(save.state, element, amount.amount);
   }
   rollElementShards(save, shardsFromShipValue(save.state));
   const oldState = save.state;
   const oldData = save.data;
   save.state = new GameState();
   // Carry over
   addResource("Warp", resourceOf("Warp", oldState.resources).current, save.state.resources);
   save.state.permanentElements = oldState.permanentElements;
   save.data.permanentElementChoices = oldData.permanentElementChoices;

   initGameState(save.state);
}

export function addElementShard(gs: GameState, element: ElementSymbol, amount: number): void {
   const inventory = gs.permanentElements.get(element);
   if (inventory) {
      inventory.amount += amount;
   } else {
      gs.permanentElements.set(element, { amount, hp: 0, damage: 0 });
   }
}

export function addElementThisRun(gs: GameState, element: ElementSymbol, amount: number): void {
   const inventory = gs.elements.get(element);
   if (inventory) {
      inventory.amount += amount;
   } else {
      gs.elements.set(element, { amount, hp: 0, damage: 0 });
   }
}

export function rollElementShards(save: SaveGame, amount: number) {
   const candidates: ElementSymbol[] = [];

   for (let i = 0; i < amount; i++) {
      if (candidates.length < DefaultElementChoices) {
         getUnlockedElements(save.state, candidates);
         shuffle(candidates);
      }

      const choices: ElementSymbol[] = [];
      for (let j = 0; j < DefaultElementChoices; j++) {
         const element = candidates.pop();
         if (element) {
            choices.push(element);
         }
      }

      save.data.permanentElementChoices.push({
         choices,
         stackSize: 1,
      });
   }
}
