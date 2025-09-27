import { expect, test } from "vitest";
import { GameState, SaveGame } from "../GameState";
import type { ITileData } from "../ITileData";
import { getBuildingCost, getNextLevel, getTotalBuildingCost, upgradeMax } from "./BuildingLogic";
import { addResource, resourceOf } from "./ResourceLogic";
import { Runtime } from "./Runtime";

test("totalBuildingValue", () => {
   let xp = 0;
   for (let i = 6; i <= 10; i++) {
      xp += getBuildingCost("AC30", i);
   }
   expect(xp).toBe(getTotalBuildingCost("AC30", 5, 10));
   expect(xp).toBe(getTotalBuildingCost("AC30", 10, 5));
   xp = 0;
   for (let i = 1; i <= 5; i++) {
      xp += getBuildingCost("AC30", i);
   }
   expect(xp).toBe(getTotalBuildingCost("AC30", 5, 0));
});

test("upgradeMax", () => {
   const rt = new Runtime(new SaveGame(), new GameState());
   addResource("XP", 1000, rt.left.resources);
   rt.leftStat.tabulate(rt.left, rt);

   const tile: ITileData = { type: "AC30", level: 5 };
   upgradeMax(tile, rt.left);
   expect(tile.level).toBe(13);
   expect(resourceOf("XP", rt.left.resources).used).toBe(getTotalBuildingCost("AC30", 5, 13));
   expect(resourceOf("XP", rt.left.resources).current).toBeLessThan(getTotalBuildingCost("AC30", 5, 13));
});

test("getNextLevel", () => {
   expect(getNextLevel(15, -5)).toBe(10);
   expect(getNextLevel(11, 5)).toBe(15);
   expect(getNextLevel(16, 5)).toBe(20);
   expect(getNextLevel(15, -10)).toBe(10);
});

test("simulateBattle", () => {
   // const ship = jsonDecode<GameState>(TestShip);
   // simulateBattle(ship, ship);
});
