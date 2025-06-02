import { expect, test } from "vitest";
import { insertSorted } from "./Helper";

test("insertSorted", () => {
   const array = [2, 4, 6, 8, 10];
   const compare = (a: number, b: number) => a - b;
   insertSorted(array, 6, compare);
   expect(array).toEqual([2, 4, 6, 6, 8, 10]);

   insertSorted(array, 3, compare);
   expect(array).toEqual([2, 3, 4, 6, 6, 8, 10]);

   insertSorted(array, 1, compare);
   expect(array).toEqual([1, 2, 3, 4, 6, 6, 8, 10]);
});
