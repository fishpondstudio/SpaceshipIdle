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
   B4: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         return t(L.GetXXP, formatNumber(quantumToXP(quantum + 5) - quantumToXP(quantum)));
      },
      onStart: (runtime: Runtime) => {
         const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
         addResource("XP", quantumToXP(quantum + 5) - quantumToXP(quantum), runtime.left.resources);
      },
   }),
   B5: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.GetXVictoryPoint, 20),
      onStart: (runtime: Runtime) => {
         addResource("VictoryPoint", 20, runtime.left.resources);
      },
   }),
   B6: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.ReduceBackstabberPenaltyToX, 0),
      onStart: (runtime: Runtime) => {
         changeStat("Backstabber", 0, runtime.left.stats);
      },
   }),
   B7: cast<IBoostDefinition>({
      desc: (runtime: Runtime) => t(L.GetXWarp, formatNumber(6 * 60 * 60)),
      onStart: (runtime: Runtime) => {
         addResource("Warp", 6 * 60 * 60, runtime.left.resources);
      },
   }),
} as const satisfies Record<string, IBoostDefinition>;

export type Boost = keyof typeof Boosts;
