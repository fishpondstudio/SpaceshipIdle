import { Tooltip } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import type { GameState } from "@spaceship-idle/shared/src/game/GameState";
import { getBuildingName } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { calcSpaceshipXP, getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getTechName } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { formatNumber, mMapOf, mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
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
            <div>{mReduceOf(ship.tiles, (prev, tile, data) => prev + 1, 0)}</div>
         </div>
         <div className="row g5">
            <div className="f1">{t(L.Research)}</div>
            <div>{ship.unlockedTech.size}</div>
            <Tooltip.Floating
               multiline
               label={Array.from(ship.unlockedTech)
                  .map((tech) => getTechName(tech))
                  .join(", ")}
            >
               <div className="mi sm text-space">info</div>
            </Tooltip.Floating>
         </div>
         <div className="divider mx-10 my5 dashed" />
         <div className="f1">{t(L.ElementThisRun)}</div>
         <div className="text-sm">
            {mMapOf(ship.elements, (element, data) => {
               const building = Config.Elements[element];
               if (!building) {
                  return null;
               }
               return (
                  <div className="row" key={element}>
                     <div>
                        {element} <span className="text-dimmed">({getBuildingName(building)})</span>
                     </div>
                     <div className="f1 text-right">
                        {data.hp} + {data.damage} ({data.amount})
                     </div>
                  </div>
               );
            })}
         </div>
      </>
   );
}
