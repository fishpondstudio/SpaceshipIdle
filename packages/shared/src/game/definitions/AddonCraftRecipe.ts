import { forEach, safePush } from "../../utils/Helper";
import type { Addon } from "./Addons";

export const AddonCraftRecipe: Partial<Record<Addon, Partial<Record<Addon, number>>>> = {
   Damage2: {
      Evasion1: 1,
      Damage1: 1,
   },
   Damage4: {
      Damage2: 1,
      Damage3: 1,
   },
   HP3: {
      HP1: 1,
      HP2: 1,
   },
   Damage6: {
      Damage5: 2,
   },
} as const;

export const AddonCraftInfo: Partial<Record<Addon, Addon[]>> = {};

forEach(AddonCraftRecipe, (craftInfo, recipe) => {
   forEach(recipe, (craftFrom, amount) => {
      safePush(AddonCraftInfo, craftFrom, craftInfo);
   });
});
