import { cast, formatNumber } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { IHaveXY } from "../../utils/Vector2";
import { quantumToXP } from "../logic/QuantumElementLogic";
import { addResource, changeStat } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { getMaxQuantumForShipClass } from "../logic/TechLogic";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IBonusDefinition {
   desc: (runtime: Runtime) => string;
   onStart?: (runtime: Runtime, from?: IHaveXY) => void;
   onTick?: (timeLeft: number, source: string, runtime: Runtime) => void;
   onStop?: (runtime: Runtime) => void;
}

export const Bonus = {
   // General
   G1a: cast<IBonusDefinition>({
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

   // Friendships
   F1a: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
      },
   }),
   F1b: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnExpirationHTML, 8),
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 8, runtime.left.resources);
      },
   }),
   F1c: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, 3, 3),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("VictoryPoint", 3, runtime.left.resources, from);
      },
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
      },
   }),
   F1d: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, 4),
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 4, runtime.left.resources);
      },
   }),

   // Directives
   D1a: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         return t(L.PlusXXP, formatNumber(quantumToXP(quantum + 5) - quantumToXP(quantum)));
      },
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         addResource("XP", quantumToXP(quantum + 5) - quantumToXP(quantum), runtime.left.resources, from);
      },
   }),
   D1b: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.PlusXVictoryPoint, 20),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("VictoryPoint", 20, runtime.left.resources, from);
      },
   }),
   D1c: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.ResetBackstabberPenaltyToX, 0),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         changeStat("Backstabber", 0, runtime.left.stats);
      },
   }),
   D1d: cast<IBonusDefinition>({
      desc: (runtime: Runtime) => t(L.PlusXWarp, formatNumber(6 * 60 * 60)),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("Warp", 6 * 60 * 60, runtime.left.resources, from);
      },
   }),
} as const satisfies Record<string, IBonusDefinition>;

export type Bonus = keyof typeof Bonus;
