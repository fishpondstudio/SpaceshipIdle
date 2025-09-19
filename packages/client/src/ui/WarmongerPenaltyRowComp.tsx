import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatHMS, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export function WarmongerPenaltyRowComp(): React.ReactNode {
   const warmongerPenalty = getWarmongerPenalty(G.save.state);
   const rawWarmongerPenalty = getStat("Warmonger", G.save.state.stats);
   return (
      <>
         <div className="f1">
            <div>{t(L.WarmongerPenalty)}</div>
            {rawWarmongerPenalty > G.runtime.leftStat.warmongerMin.value ? (
               <div className="text-xs text-space">
                  <div>
                     - {t(L.WarmongerPenaltyDecrease)}: {G.runtime.leftStat.warmongerDecrease.value}/s
                  </div>
                  <div>
                     - {t(L.TimeToZero)}{" "}
                     {formatHMS(((rawWarmongerPenalty - 0) * SECOND) / G.runtime.leftStat.warmongerDecrease.value)}
                  </div>
                  <div>
                     - {t(L.TimeToMin)}{" "}
                     {formatHMS(
                        ((rawWarmongerPenalty - G.runtime.leftStat.warmongerMin.value) * SECOND) /
                           G.runtime.leftStat.warmongerDecrease.value,
                     )}
                  </div>
               </div>
            ) : null}
         </div>
         <div>{warmongerPenalty}</div>
      </>
   );
}
