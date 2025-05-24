import { expect, test } from "vitest";
import { CURRENCY_EPSILON } from "../../utils/Helper";
import { quantumToSpaceshipValue, spaceshipValueToQuantum } from "./ResourceLogic";

test("spaceshipValueToQuantum", () => {
   for (let q = 10; q <= 10_000; q++) {
      const sv = quantumToSpaceshipValue(q);
      const q2 = spaceshipValueToQuantum(sv);
      expect(Math.abs(q - q2) <= CURRENCY_EPSILON, `q1: ${q}, q2: ${q2}, sv: ${sv}`).toBeTruthy();
   }
});
