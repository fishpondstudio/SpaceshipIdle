import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { BuildingFlag } from "@spaceship-idle/shared/src/game/definitions/BuildingProps";
import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { calcSpaceshipXP, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getTechName } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, hasFlag, mMapOf, mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import type React from "react";

export function MatchmakingShipComp({ ship }: { ship: GameState }): React.ReactNode {
   return (
      <>
         <div className="row text-space">
            <div>{t(L.SpaceshipPrefix, ship.name)}</div>
            <div className="f1" />
         </div>
         <div className="row">
            <div className="f1">{t(L.Quantum)}</div>
            <div>{formatNumber(getUsedQuantum(ship))}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.SpaceshipXP)}</div>
            <div>{formatNumber(calcSpaceshipXP(ship))}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.Modules)}</div>
            <div>
               {mReduceOf(
                  ship.tiles,
                  (prev, tile, data) =>
                     hasFlag(Config.Buildings[data.type].buildingFlag, BuildingFlag.Booster) ? prev : prev + 1,
                  0,
               )}
            </div>
         </div>
         <div className="row">
            <div className="f1">{t(L.Boosters)}</div>
            <div>
               {mReduceOf(
                  ship.tiles,
                  (prev, tile, data) =>
                     hasFlag(Config.Buildings[data.type].buildingFlag, BuildingFlag.Booster) ? prev + 1 : prev,
                  0,
               )}
            </div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.Research)}</div>
            <div>{ship.unlockedTech.size}</div>
            <Tooltip
               multiline
               maw="30vw"
               label={Array.from(ship.unlockedTech)
                  .map((tech) => getTechName(tech))
                  .join(", ")}
            >
               <div className="mi sm text-space">info</div>
            </Tooltip>
         </div>
         <div className="divider mx-10 my5 dashed" />
         <div className="f1">{t(L.ElementThisRun)}</div>
         <div className="text-sm">
            {mMapOf(ship.elements, (element, amount) => {
               const building = Config.Elements[element];
               if (!building) {
                  return null;
               }
               return (
                  <div className="row" key={element}>
                     <div>
                        {element} <span className="text-dimmed">({Config.Buildings[building].name()})</span>
                     </div>
                     <div className="f1 text-right">{amount}</div>
                  </div>
               );
            })}
         </div>
      </>
   );
}
