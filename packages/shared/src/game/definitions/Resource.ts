import { cast } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { QuantumElementId, VictoryPointElementId, WarpElementId, XPElementId } from "./Constant";

export interface IResourceDefinition {
   name: () => string;
   texture: string;
   texture24: string;
   domId: string;
}

export const Resources = {
   XP: cast<IResourceDefinition>({
      name: () => t(L.XP),
      texture: "Others/XP",
      texture24: "Others/XP24",
      domId: XPElementId,
   }),
   VictoryPoint: cast<IResourceDefinition>({
      name: () => t(L.VictoryPoint),
      texture: "Others/Trophy16",
      texture24: "Others/Trophy",
      domId: VictoryPointElementId,
   }),
   Warp: cast<IResourceDefinition>({
      name: () => t(L.TimeWarp),
      texture: "Others/Warp16",
      texture24: "Others/Warp",
      domId: WarpElementId,
   }),
   Quantum: cast<IResourceDefinition>({
      name: () => t(L.Quantum),
      texture: "Others/Quantum",
      texture24: "Others/Quantum24",
      domId: QuantumElementId,
   }),
} as const satisfies Record<string, IResourceDefinition>;

export type Resource = keyof typeof Resources;
