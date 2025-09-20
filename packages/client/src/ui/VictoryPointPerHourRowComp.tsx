import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatHMS, formatNumber, HOUR, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export function VictoryPointPerHourRowComp(): React.ReactNode {
   const vpPerHour = G.runtime.leftStat.victoryPointPerHour.value;
   if (vpPerHour === 0) return null;
   return (
      <div className="row fstart">
         <div className="f1">
            <div>{t(L.VictoryPointPerHour)}</div>
            <div className="text-xs text-space">
               - {t(L.TimeUntilNextReward, formatHMS(HOUR - getStat("VictoryPointTimer", G.save.state.stats) * SECOND))}
            </div>
         </div>
         <div>{formatNumber(vpPerHour)}</div>
      </div>
   );
}
