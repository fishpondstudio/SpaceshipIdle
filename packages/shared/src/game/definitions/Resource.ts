import { EmptyString } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export interface IResourceDefinition {
   name: () => string;
}

export const Resources = {
   XP: { name: () => t(L.XP) },
   XPUsed: { name: () => EmptyString },

   Victory: { name: () => t(L.Victory) },
   VictoryUsed: { name: () => EmptyString },

   Defeat: { name: () => EmptyString },

   Warp: { name: () => t(L.TimeWarp) },
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
