import { expect, test } from "vitest";
import { getElementUpgradeCost, getTotalElementUpgradeCost } from "./QuantumElementLogic";

test("getTotalElementUpgradeCost", () => {
   expect(getTotalElementUpgradeCost(1)).toBe(getElementUpgradeCost(1));
   expect(getTotalElementUpgradeCost(2)).toBe(getElementUpgradeCost(1) + getElementUpgradeCost(2));
   expect(getTotalElementUpgradeCost(3)).toBe(
      getElementUpgradeCost(1) + getElementUpgradeCost(2) + getElementUpgradeCost(3),
   );
   expect(getTotalElementUpgradeCost(4)).toBe(
      getElementUpgradeCost(1) + getElementUpgradeCost(2) + getElementUpgradeCost(3) + getElementUpgradeCost(4),
   );
   expect(getTotalElementUpgradeCost(5)).toBe(
      getElementUpgradeCost(1) +
         getElementUpgradeCost(2) +
         getElementUpgradeCost(3) +
         getElementUpgradeCost(4) +
         getElementUpgradeCost(5),
   );
});
