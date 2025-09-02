import { cast } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";

export interface IResourceDefinition {
   name: () => string;
   texture: string;
}

export const Resources = {
   XP: cast<IResourceDefinition>({ name: () => t(L.XP), texture: "Others/XP" }),
   VictoryPoint: cast<IResourceDefinition>({ name: () => t(L.VictoryPoint), texture: "Others/Trophy16" }),
   Warp: cast<IResourceDefinition>({ name: () => t(L.TimeWarp), texture: "Others/Warp16" }),
   Quantum: cast<IResourceDefinition>({ name: () => t(L.Quantum), texture: "Others/Quantum" }),
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
