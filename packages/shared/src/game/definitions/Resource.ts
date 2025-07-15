import { L, t } from "../../utils/i18n";

export interface IResourceDefinition {
   name: () => string;
}

export const Resources = {
   XP: { name: () => t(L.XP) },
   XPUsed: { name: () => t(L.XPUsed) },
   Warp: { name: () => t(L.TimeWarp) },
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
