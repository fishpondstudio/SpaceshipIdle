import { expect, test } from "vitest";
import { CURRENCY_EPSILON } from "../../utils/Helper";
import { quantumToXP, xpToQuantum } from "./QuantumElementLogic";

test("spaceshipValueToQuantum", () => {
   for (let q = 10; q <= 10_000; q++) {
      const sv = quantumToXP(q);
      const q2 = xpToQuantum(sv);
      expect(Math.abs(q - q2) <= CURRENCY_EPSILON, `q1: ${q}, q2: ${q2}, sv: ${sv}`).toBeTruthy();
   }
});
