import { Config } from "@spaceship-idle/shared/src/game/Config";
import { canSpend } from "@spaceship-idle/shared/src/game/logic/BuildingLogic";
import { classNames, formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import type React from "react";
import { G } from "../../utils/Global";

export function ResourceListComp({ xp, showColor = true }: { xp: number; showColor?: boolean }): React.ReactNode {
   const color = canSpend(xp, G.save.current) ? "text-green" : "text-red";
   return (
      <div className="row">
         <div className="f1">{Config.Resources.XP.name()}</div>
         <div className={classNames(showColor ? color : null)}>{formatNumber(xp)}</div>
      </div>
   );
}
