import { expect, test } from "vitest";
import { GameState, SaveGame } from "../GameState";
import type { ITileData } from "../ITileData";
import { getBuildingCost, getNextLevel, getTotalBuildingCost, upgradeMax } from "./BuildingLogic";
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
   rt.left.resources.set("XP", 1000);
   rt.leftStat.tabulate(rt.tabulateHp(rt.left.tiles), rt.left);

   const tile: ITileData = { type: "AC30", level: 5 };
   upgradeMax(tile, rt.left);
   expect(tile.level).toBe(13);
   expect(rt.left.resources.get("XPUsed")).toBe(getTotalBuildingCost("AC30", 5, 13));
   expect(rt.left.resources.get("XP")! - rt.left.resources.get("XPUsed")!).toBeLessThan(
      getTotalBuildingCost("AC30", 5, 13),
   );
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
