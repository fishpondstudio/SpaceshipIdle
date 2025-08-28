import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";

export function GalaxyInfoPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const stat = G.runtime.leftStat;
   const warmongerPenalty = getStat("Warmonger", G.save.state.stats);
   return (
      <div className="top-left-panel text-sm">
         <div className="row">
            <div className="f1">Current Friendship</div>
            <div>1/3</div>
         </div>
         <FloatingTip
            label={
               <>
                  <div>
                     Current Warmonger Penalty is <b>{getWarmongerPenalty(G.save.state)}</b> ( rounded up from{" "}
                     <b className="text-tabular-nums">{warmongerPenalty.toFixed(3)}</b>). It is increased when you
                     declare war. It makes declaring further wars and declaring friendship more expensive
                  </div>
                  <div className="divider mx-10 my5" />
                  <div>
                     Warmonger Penalty is decreased by <b>{stat.warmongerDecrease.value}/s</b> until it reaches 0,
                     detailed as follows
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
            }
         >
            <div className="row">
               <div className="f1">Warmonger Penalty</div>
               <div>
                  {warmongerPenalty > 0 ? (
                     <span className="text-xs text-green">({-G.runtime.leftStat.warmongerDecrease.value}/s) </span>
                  ) : null}
                  {Math.ceil(warmongerPenalty)}
               </div>
            </div>
         </FloatingTip>
         <div className="row">
            <div className="f1">Backstabber Penalty</div>
            <div>{getStat("Backstabber", G.save.state.stats)}</div>
         </div>
      </div>
   );
}
