import { expect, test } from "vitest";
import { mapSafeAdd } from "../../utils/Helper";
import { jsonDecode } from "../../utils/Serialization";
import type { Resource } from "../definitions/Resource";
import { GameState, SaveGame } from "../GameState";
import type { ITileData } from "../ITileData";
import { simulateBattle } from "./BattleLogic";
import { getBuildingValue, getNextLevel, getTotalBuildingValue, upgradeMax } from "./BuildingLogic";
import { Runtime } from "./Runtime";
import TestShip from "./TestShip.json?raw";

test("totalBuildingValue", () => {
   const result = new Map<Resource, number>();
   for (let i = 6; i <= 10; i++) {
      const value = getBuildingValue("AC130", i);
      for (const [res, v] of value) {
         mapSafeAdd(result, res, v);
      }
   }
   getTotalBuildingValue("AC130", 5, 10).forEach((v, res) => {
      expect(result.get(res)).toBe(v);
   });
   getTotalBuildingValue("AC130", 10, 5).forEach((v, res) => {
      expect(result.get(res)).toBe(v);
   });
   result.clear();
   for (let i = 1; i <= 5; i++) {
      const value = getBuildingValue("AC130", i);
      for (const [res, v] of value) {
         mapSafeAdd(result, res, v);
      }
   }
   getTotalBuildingValue("AC130", 5, 0).forEach((v, res) => {
      expect(result.get(res)).toBe(v);
   });
   getTotalBuildingValue("PM1Booster", 5, 10).forEach((v, res) => {
      expect(result.get(res)).toBe(0);
   });
});

test("upgradeMax", () => {
   const rt = new Runtime(new SaveGame(), new GameState());
   rt.left.resources.set("XP", 1000);
   rt.leftStat.tabulate(rt);

   const tile: ITileData = { type: "AC76", level: 5, priority: 1, capacity: 1 };
   upgradeMax(tile, rt.left);
   expect(tile.level).toBe(9);
   getTotalBuildingValue("AC76", 5, 9).forEach((v, res) => {
      expect(rt.left.resources.get(res)).toBe(1000 - v);
   });
   getTotalBuildingValue("AC76", 5, 9).forEach((v, res) => {
      expect(rt.left.resources.get(res)).toBeLessThan(v);
   });
});

test("getNextLevel", () => {
   expect(getNextLevel(15, -5)).toBe(10);
   expect(getNextLevel(11, 5)).toBe(15);
   expect(getNextLevel(16, 5)).toBe(20);
   expect(getNextLevel(15, -10)).toBe(10);
});

test("simulateBattle", () => {
   const ship = jsonDecode<GameState>(TestShip);
   simulateBattle(ship, ship);
});
