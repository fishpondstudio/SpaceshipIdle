import { L, t } from "../../utils/i18n";

export interface IResourceDefinition {
   name: () => string;
}

export const Resources = {
   XP: { name: () => t(L.XP) },
   Power: { name: () => t(L.Power) },
   Warp: { name: () => t(L.TimeWarp) },

   Ti: { name: () => t(L.Ti) },
   U: { name: () => t(L.Uranium) },
   H: { name: () => t(L.Hydrogen) },
   D2: { name: () => t(L.D2) },
   Si: { name: () => t(L.Si) },

   Rocket: { name: () => t(L.Rocket) },
   Circuit: { name: () => t(L.Circuit) },
   Antimatter: { name: () => t(L.Antimatter) },

   AC30: { name: () => t(L.AC30) },
   AC30x3: { name: () => t(L.AC30x3) },
   AC30A: { name: () => t(L.AC30A) },
   AC30B: { name: () => t(L.AC30B) },

   AC76: { name: () => t(L.AC76) },
   AC76x2: { name: () => t(L.AC76x2) },
   AC76A: { name: () => t(L.AC76A) },
   AC76B: { name: () => t(L.AC76B) },

   AC130: { name: () => t(L.AC130) },
   AC130A: { name: () => t(L.AC130A) },
   AC130B: { name: () => t(L.AC130B) },
   AC130C: { name: () => t(L.AC130C) },

   MS1: { name: () => t(L.MS1) },
   MS1A: { name: () => t(L.MS1A) },
   MS1B: { name: () => t(L.MS1B) },

   MS2: { name: () => t(L.MS2) },
   MS2A: { name: () => t(L.MS2A) },
   MS2B: { name: () => t(L.MS2B) },
   MS2C: { name: () => t(L.MS2C) },
   MS2D: { name: () => t(L.MS2D) },

   MS3: { name: () => t(L.MS3) },

   FD1: { name: () => t(L.FD1) },

   LA1: { name: () => t(L.LA1) },
   LA1A: { name: () => t(L.LA1A) },
   LA1B: { name: () => t(L.LA1B) },

   LA2: { name: () => t(L.LA2) },
   LA2A: { name: () => t(L.LA2A) },

   RC50: { name: () => t(L.RC50) },
   RC50A: { name: () => t(L.RC50A) },
   RC50B: { name: () => t(L.RC50B) },

   RC100: { name: () => t(L.RC100) },
   RC100A: { name: () => t(L.RC100A) },
   RC100B: { name: () => t(L.RC100B) },
   RC100C: { name: () => t(L.RC100C) },
   RC100D: { name: () => t(L.RC100D) },

   PC1: { name: () => t(L.PC1) },
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
