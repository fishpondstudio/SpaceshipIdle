import { formatNumber } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import { quantumToXP } from "../logic/QuantumElementLogic";
import { addResource, changeStat } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { getMaxQuantumForShipClass } from "../logic/TechLogic";
import { BaseWarmongerChangePerSec } from "./Constant";

const SkiffClass1XPMultiplier: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.XClassWeaponsGetXXPMultiplier, t(L.TechSkiff), 1),
   onTick: (timeLeft: number, source: string, runtime: Runtime) => {
      runtime.left.tiles.forEach((data, tile) => {
         const rs = runtime.get(tile);
         const shipClass = Config.BuildingToShipClass[data.type];
         if (rs && shipClass === "Skiff") {
            rs.xpMultiplier.add(1, source);
         }
      });
   },
};

const Reduce1WarmongerPerSec: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec),
   onTick: (timeLeft: number, source: string, runtime: Runtime) => {
      runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec, source);
   },
};

const Get8VictoryPointOnExp: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.XVictoryPointOnExpirationHTML, 8),
   onStop: (runtime: Runtime) => {
      addResource("VictoryPoint", 8, runtime.left.resources);
   },
};

const Get3VictoryPointOnDeclExp: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, 3, 3),
   onStart: (runtime: Runtime, from?: IHaveXY) => {
      addResource("VictoryPoint", 3, runtime.left.resources, from);
   },
   onStop: (runtime: Runtime) => {
      addResource("VictoryPoint", 3, runtime.left.resources);
   },
};

const Get4VictoryPointOnDecl: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, 4),
   onStop: (runtime: Runtime) => {
      addResource("VictoryPoint", 4, runtime.left.resources);
   },
};

const Get2hWarpOnExp: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.PlusXWarpOnExpiration, formatNumber(2 * 60 * 60)),
   onStart: (runtime: Runtime, from?: IHaveXY) => {
      addResource("Warp", 2 * 60 * 60, runtime.left.resources, from);
   },
};

const GetSkiffClassXPOnDecl: IBonusDefinition = {
   desc: (runtime: Runtime) => {
      const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
      return t(L.PlusXXP, formatNumber(quantumToXP(quantum + 5) - quantumToXP(quantum)));
   },
   onStart: (runtime: Runtime, from?: IHaveXY) => {
      const quantum = getMaxQuantumForShipClass("Skiff", runtime.left);
      addResource("XP", quantumToXP(quantum + 5) - quantumToXP(quantum), runtime.left.resources, from);
   },
};

const Get20VictoryPointOnDecl: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.PlusXVictoryPoint, 20),
   onStart: (runtime: Runtime, from?: IHaveXY) => {
      addResource("VictoryPoint", 20, runtime.left.resources, from);
   },
};

const ResetBackstabberPenaltyTo0OnDecl: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.ResetBackstabberPenaltyToX, 0),
   onStart: (runtime: Runtime, from?: IHaveXY) => {
      changeStat("Backstabber", 0, runtime.left.stats);
   },
};

const Get8hWarpOnDecl: IBonusDefinition = {
   desc: (runtime: Runtime) => t(L.PlusXWarp, formatNumber(8 * 60 * 60)),
   onStart: (runtime: Runtime, from?: IHaveXY) => {
      addResource("Warp", 8 * 60 * 60, runtime.left.resources, from);
   },
};

export interface IBonusDefinition {
   desc: (runtime: Runtime) => string;
   onStart?: (runtime: Runtime, from?: IHaveXY) => void;
   onTick?: (timeLeft: number, source: string, runtime: Runtime) => void;
   onStop?: (runtime: Runtime) => void;
}

export const Bonus = {
   SkiffClass1XPMultiplier,
   Reduce1WarmongerPerSec,

   Get8VictoryPointOnExp,
   Get3VictoryPointOnDeclExp,
   Get4VictoryPointOnDecl,
   Get2hWarpOnExp,

   GetSkiffClassXPOnDecl,
   Get20VictoryPointOnDecl,
   ResetBackstabberPenaltyTo0OnDecl,
   Get8hWarpOnDecl,
} as const satisfies Record<string, IBonusDefinition>;

export type Bonus = keyof typeof Bonus;
