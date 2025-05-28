import { expect, test } from "vitest";
import { createTile } from "../utils/Helper";
import { GameState, hashGameState, hashGameStatePair } from "./GameState";

test("hashGameState", () => {
   const gs = new GameState();
   gs.tiles.set(createTile(0, 0), { type: "AC30", level: 1, priority: 3, capacity: 99 });
   gs.tiles.set(createTile(0, 1), { type: "AC130", level: 2, priority: 2, capacity: 98 });
   gs.tiles.set(createTile(0, 2), { type: "RC50", level: 3, priority: 1, capacity: 97 });
   const hash1 = hashGameState(gs);

   gs.tiles.set(createTile(0, 2), { type: "RC50", level: 4, priority: 1, capacity: 97 });
   const hash2 = hashGameState(gs);
   expect(hash1).not.toBe(hash2);

   gs.tiles.set(createTile(0, 2), { type: "RC50", level: 3, priority: 1, capacity: 97 });
   const hash3 = hashGameState(gs);
   expect(hash1).toBe(hash3);

   const gs2 = new GameState();
   gs2.tiles.set(createTile(0, 0), { type: "MS1", level: 6, priority: 7, capacity: 88 });
   expect(hashGameStatePair(gs, gs2)).toBe(hashGameStatePair(gs2, gs));
});
