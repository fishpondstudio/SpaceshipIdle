import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { G } from "../utils/Global";

export function WarmongerPenaltyTooltip(): React.ReactNode {
   const stat = G.runtime.leftStat;
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   return (
      <>
         <div>
            Current Warmonger Penalty is <b>{getWarmongerPenalty(G.save.state)}</b> ( rounded up from{" "}
            <b className="text-tabular-nums">{warmongerPenalty.toFixed(3)}</b>). It is increased when you declare war.
            It makes declaring further wars and declaring friendship more expensive
         </div>
         <div className="divider mx-10 my5" />
         <div>
            Warmonger Penalty is decreased by <b>{stat.warmongerDecrease.value}/s</b> until it reaches 0, detailed as
            follows
         </div>
         <div className="flex-table mx-10 mt5">
            {stat.warmongerDecrease.detail.map((m) => (
               <div className="row" key={m.source}>
                  <div className="f1">{m.source}</div>
                  <div>{m.value}</div>
               </div>
            ))}
         </div>
      </>
   );
}
