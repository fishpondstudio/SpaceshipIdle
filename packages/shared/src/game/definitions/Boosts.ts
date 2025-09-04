import { cast, formatNumber } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import { quantumToXP } from "../logic/QuantumElementLogic";
import { addResource, changeStat } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { getMaxQuantumForShipClass } from "../logic/TechLogic";
import { BaseWarmongerChangePerSec } from "./Constant";

export interface IBoostDefinition {
   desc: (runtime: Runtime) => string;
   onStart?: (runtime: Runtime) => void;
   onTick?: (timeLeft: number, source: string, runtime: Runtime) => void;
   onStop?: (runtime: Runtime) => void;
}

export const Boosts = {
   B1: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
      },
   }),
   B2: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, 8),
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", 8, runtime.left.resources);
      },
   }),
   B3: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, 3, 3),
      onStart: (runtime: Runtime) => {
         addResource("VictoryPoint", 3, runtime.left.resources);
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
      onStart: (runtime: Runtime) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         addResource("XP", quantumToXP(quantum + 5) - quantumToXP(quantum), runtime.left.resources);
      },
   }),
   D1b: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.PlusXVictoryPoint, 20),
      onStart: (runtime: Runtime) => {
         addResource("VictoryPoint", 20, runtime.left.resources);
      },
   }),
   D1c: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.ResetBackstabberPenaltyToX, 0),
      onStart: (runtime: Runtime) => {
         changeStat("Backstabber", 0, runtime.left.stats);
      },
   }),
   D1d: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.PlusXWarp, formatNumber(6 * 60 * 60)),
      onStart: (runtime: Runtime) => {
         addResource("Warp", 6 * 60 * 60, runtime.left.resources);
      },
   }),
   D1e: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.XpMultiplierForAllSkiffClassWeapons, 1),
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
