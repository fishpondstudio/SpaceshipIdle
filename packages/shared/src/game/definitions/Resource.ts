import { cast, EmptyString } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export interface IResourceDefinition {
   name: () => string;
   texture?: string;
}

export const Resources = {
   XP: cast<IResourceDefinition>({ name: () => t(L.XP), texture: "Others/XP" }),
   VictoryPoint: cast<IResourceDefinition>({ name: () => t(L.VictoryPoint), texture: "Others/Trophy16" }),
   Victory: cast<IResourceDefinition>({ name: () => EmptyString }),
   Defeat: cast<IResourceDefinition>({ name: () => EmptyString }),
   Warp: cast<IResourceDefinition>({ name: () => t(L.TimeWarp) }),
   Warmonger: cast<IResourceDefinition>({ name: () => EmptyString }),
   Backstabber: cast<IResourceDefinition>({ name: () => EmptyString }),
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
