import { cast, formatNumber } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { IHaveXY } from "../../utils/Vector2";
import { quantumToXP } from "../logic/QuantumElementLogic";
import { addResource, changeStat } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { getMaxQuantumForShipClass } from "../logic/TechLogic";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IBoostDefinition {
   desc: (runtime: Runtime) => string;
   onStart?: (runtime: Runtime, from?: IHaveXY) => void;
   onTick?: (timeLeft: number, source: string, runtime: Runtime) => void;
   onStop?: (runtime: Runtime) => void;
}

export const Boosts = {
   // Friendships
   F1a: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
      },
   }),
   F1b: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, 8),
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 8, runtime.left.resources);
      },
   }),
   F1c: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, 3, 3),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("VictoryPoint", 3, runtime.left.resources, from);
      },
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
      },
   }),

   // Directives
   D1a: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         return t(L.PlusXXP, formatNumber(quantumToXP(quantum + 5) - quantumToXP(quantum)));
      },
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         addResource("XP", quantumToXP(quantum + 5) - quantumToXP(quantum), runtime.left.resources, from);
      },
   }),
   D1b: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.PlusXVictoryPoint, 20),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("VictoryPoint", 20, runtime.left.resources, from);
      },
   }),
   D1c: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.ResetBackstabberPenaltyToX, 0),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         changeStat("Backstabber", 0, runtime.left.stats);
      },
   }),
   D1d: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.PlusXWarp, formatNumber(6 * 60 * 60)),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("Warp", 6 * 60 * 60, runtime.left.resources, from);
      },
   }),
   D1e: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XClassWeaponsGetXXPMultiplier, t(L.TechSkiff), 1),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            if (rs) {
               rs.xpMultiplier.add(1, source);
            }
         });
      },
   }),
} as const satisfies Record<string, IBoostDefinition>;

export type Boost = keyof typeof Boosts;
