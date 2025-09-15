import { EN } from "../languages/en";
import { isNullOrUndefined } from "./Helper";

export function t(str: string, ...subs: (string | number)[]): string {
   const translation = str;
   if (translation) {
      return interpolate(translation, subs);
   }
   return `⚠️${str}`;
}

function interpolate(phase: string, subs: (string | number)[]): string {
   return phase
      .split("%%")
      .map((part, idx, array) => {
         if (!subs) {
            return part;
         }
         if (idx >= array.length - 1) {
            return part;
         }
         if (!isNullOrUndefined(subs[idx])) {
            return part + subs[idx];
         }
         return `${part}⚠️${idx}`;
      })
      .join("");
}

// We need to clone it because when switching languages, we will mutate the object!
export const L = structuredClone(EN);
