import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { html } from "./components/RenderHTMLComp";

export function WarmongerPenaltyTooltip(): React.ReactNode {
   const stat = G.runtime.leftStat;
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   return (
      <>
         <div>
            {html(
               t(L.WarmongerPenaltyDesc, getWarmongerPenalty(G.save.state), warmongerPenalty.toFixed(3)),
               "render-html",
            )}
         </div>
         <div className="divider mx-10 my5" />
         <div>
            Warmonger Penalty is decreased by <b>{stat.warmongerDecrease.value}</b> until it reaches{" "}
            <b>{stat.warmongerMin.value}</b>, detailed as follows
         </div>
         <div className="flex-table mx-10 mt5">
            <div className="row fstart">
               <div className="f1">
                  <div>Warmonger Penalty Decrease</div>
                  <div className="text-xs text-space">
                     {stat.warmongerDecrease.detail.map((m) => (
                        <div key={m.source}>
                           - {m.source}: {formatNumber(m.value)}
                        </div>
                     ))}
                  </div>
               </div>
               <div>{stat.warmongerDecrease.value}/s</div>
            </div>
            <div className="row fstart">
               <div className="f1">
                  <div>Minimum Warmonger Penalty</div>
                  <div className="text-xs text-space">
                     {stat.warmongerMin.detail.map((m) => (
                        <div key={m.source}>
                           - {m.source}: {formatNumber(m.value)}
                        </div>
                     ))}
                  </div>
               </div>
               <div>{formatNumber(stat.warmongerMin.value)}</div>
            </div>
         </div>
      </>
   );
}
