import { formatNumber, formatPercent } from "../../utils/Helper";
import { L, t } from "../../utils/i18n";
import type { IHaveXY } from "../../utils/Vector2";
import { Config } from "../Config";
import { quantumToXP } from "../logic/QuantumElementLogic";
import { addResource } from "../logic/ResourceLogic";
import type { Runtime } from "../logic/Runtime";
import { getMaxQuantumForShipClass } from "../logic/TechLogic";
import { BaseWarmongerChangePerSec } from "./Constant";
import { ShipClass } from "./ShipClass";

export interface IBonusDefinition {
   desc: (runtime: Runtime) => string;
   onStart?: (runtime: Runtime, from?: IHaveXY) => void;
   onTick?: (timeLeft: number, source: string, runtime: Runtime) => void;
   onStop?: (runtime: Runtime) => void;
}

export const Bonus = {
   SkiffClass1XPMultiplier: shipClassXPMultiplier("Skiff", 1),
   SkiffClass2XPMultiplier: shipClassXPMultiplier("Skiff", 2),
   ScoutClass1XPMultiplier: shipClassXPMultiplier("Scout", 1),
   ScoutClass2XPMultiplier: shipClassXPMultiplier("Scout", 2),
   CorvetteClass1XPMultiplier: shipClassXPMultiplier("Corvette", 1),
   CorvetteClass2XPMultiplier: shipClassXPMultiplier("Corvette", 2),

   Reduce10WarmongerPerSec: reduceWarmongerPerSec(1),
   Reduce15WarmongerPerSec: reduceWarmongerPerSec(1.5),

   Reduce1MinWarmonger: reduceMinWarmonger(1),
   Reduce2MinWarmonger: reduceMinWarmonger(2),
   Reduce3MinWarmonger: reduceMinWarmonger(3),

   Get5ExtraXPPerSec: extraXPPerSec(0.05),
   Get10ExtraXPPerSec: extraXPPerSec(0.1),
   Get15ExtraXPPerSec: extraXPPerSec(0.15),
   Get20ExtraXPPerSec: extraXPPerSec(0.2),

   Get2VictoryPointPerHour: victoryPointPerHour(2),
   Get4VictoryPointPerHour: victoryPointPerHour(4),
   Get6VictoryPointPerHour: victoryPointPerHour(6),
   Get8VictoryPointPerHour: victoryPointPerHour(8),
   Get10VictoryPointPerHour: victoryPointPerHour(10),

   Get8VictoryPointOnExp: victoryPointOnExpiration(8),
   Get10VictoryPointOnExp: victoryPointOnExpiration(10),
   Get12VictoryPointOnExp: victoryPointOnExpiration(12),

   Get3VictoryPointOnDeclExp: victoryPointOnDeclarationAndExpiration(3),
   Get4VictoryPointOnDeclExp: victoryPointOnDeclarationAndExpiration(4),
   Get5VictoryPointOnDeclExp: victoryPointOnDeclarationAndExpiration(5),

   Get4VictoryPointOnDecl: victoryPointOnDeclaration(4),
   Get5VictoryPointOnDecl: victoryPointOnDeclaration(5),
   Get6VictoryPointOnDecl: victoryPointOnDeclaration(6),

   Get100hWarpOnExp: hoursOfWarpOnExpiration(1),
   Get125hWarpOnExp: hoursOfWarpOnExpiration(1.25),
   Get150hWarpOnExp: hoursOfWarpOnExpiration(1.5),
   Get175hWarpOnExp: hoursOfWarpOnExpiration(1.75),
   Get200hWarpOnExp: hoursOfWarpOnExpiration(2),

   GetSkiffClassXPOnDecl: shipClassOneTimeXP("Skiff"),
   GetScoutClassXPOnDecl: shipClassOneTimeXP("Scout"),
   GetCorvetteClassXPOnDecl: shipClassOneTimeXP("Corvette"),

   Get20VictoryPointOnDecl: victoryPointOnDeclaration(20),
   Get30VictoryPointOnDecl: victoryPointOnDeclaration(30),
   Get40VictoryPointOnDecl: victoryPointOnDeclaration(40),

   ResetBackstabberOnDecl: resetBackstabberOnDeclaration(),
   ResetWarmongerOnDecl: resetWarmongerOnDeclaration(),

   Get8hWarpOnDecl: hoursOfWarpOnDeclaration(8),
   Get12hWarpOnDecl: hoursOfWarpOnDeclaration(12),
   Get16hWarpOnDecl: hoursOfWarpOnDeclaration(16),
} as const satisfies Record<string, IBonusDefinition>;

export type Bonus = keyof typeof Bonus;

function shipClassXPMultiplier(shipClass: ShipClass, xpMultiplier: number): IBonusDefinition {
   const def = ShipClass[shipClass];
   return {
      desc: (_: Runtime) => t(L.XClassWeaponsGetXXPMultiplier, def.name(), xpMultiplier),
      onTick: (_: number, source: string, runtime: Runtime) => {
         runtime.left.tiles.forEach((data, tile) => {
            const rs = runtime.get(tile);
            const buildingClass = Config.BuildingToShipClass[data.type];
            if (rs && buildingClass === shipClass) {
               rs.xpMultiplier.add(xpMultiplier, source);
            }
         });
      },
   };
}

function victoryPointOnExpiration(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.XVictoryPointOnExpirationHTML, value),
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", value, runtime.left.resources);
      },
   };
}

function victoryPointOnDeclaration(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationHTML, value),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("VictoryPoint", value, runtime.left.resources, from);
      },
   };
}

function victoryPointOnDeclarationAndExpiration(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.XVictoryPointOnDeclarationAndExpirationHTML, value, value),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("VictoryPoint", value, runtime.left.resources, from);
      },
      onStop: (runtime: Runtime) => {
         addResource("VictoryPoint", value, runtime.left.resources);
      },
   };
}

function hoursOfWarpOnExpiration(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.PlusXWarpOnExpiration, formatNumber(value * 60 * 60)),
      onStop: (runtime: Runtime, from?: IHaveXY) => {
         addResource("Warp", value * 60 * 60, runtime.left.resources, from);
      },
   };
}

function hoursOfWarpOnDeclaration(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.PlusXWarpOnDeclaration, formatNumber(value * 60 * 60)),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         addResource("Warp", value * 60 * 60, runtime.left.resources, from);
      },
   };
}

function reduceWarmongerPerSec(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.WarmongerPenaltyPerSec, BaseWarmongerChangePerSec * value),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerDecrease.add(BaseWarmongerChangePerSec * value, source);
      },
   };
}

function reduceMinWarmonger(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.ReduceMinWarmonger, formatNumber(value)),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.warmongerMin.add(-value, source);
      },
   };
}

function resetBackstabberOnDeclaration(): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.ResetBackstabberPenaltyToX, 0),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         runtime.left.stats.set("Backstabber", 0);
      },
   };
}

function resetWarmongerOnDeclaration(): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.ResetWarmongerPenaltyToX, 0),
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         runtime.left.stats.set("Warmonger", 0);
      },
   };
}

function shipClassOneTimeXP(shipClass: ShipClass): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => {
         const quantum = getMaxQuantumForShipClass(shipClass, runtime.left);
         return t(L.PlusXXPOnDeclaration, formatNumber(quantumToXP(quantum + 1) - quantumToXP(quantum - 1)));
      },
      onStart: (runtime: Runtime, from?: IHaveXY) => {
         const quantum = getMaxQuantumForShipClass(shipClass, runtime.left);
         addResource("XP", quantumToXP(quantum + 1) - quantumToXP(quantum), runtime.left.resources, from);
      },
   };
}

function extraXPPerSec(pct: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.PlusXExtraXPPerSec, formatPercent(pct)),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.extraXPPerSecond.add(pct, source);
      },
   };
}

function victoryPointPerHour(value: number): IBonusDefinition {
   return {
      desc: (runtime: Runtime) => t(L.PlusXVictoryPointPerHour, formatNumber(value)),
      onTick: (timeLeft: number, source: string, runtime: Runtime) => {
         runtime.leftStat.victoryPointPerHour.add(value, source);
      },
   };
}
