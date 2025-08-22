import { Tooltip } from "@mantine/core";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";

export function GalaxyInfoPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const stat = G.runtime.leftStat;
   const warmongerPenalty = resourceOf("Warmonger", G.save.state.resources).current;
   return (
      <div className="top-left-panel text-sm">
         <div className="row">
            <div className="f1">Current Friendship</div>
            <div>1/3</div>
         </div>
         <Tooltip
            label={
               <>
                  <div>
                     Current Warmonger Penalty is <b>{Math.ceil(warmongerPenalty)}</b> ( rounded up from{" "}
                     <b className="text-tabular-nums">{warmongerPenalty.toFixed(3)}</b>). It is increased when you
                     declare war. It makes declaring further wars and declaring friendship more expensive
                  </div>
                  <div className="divider light mx-10 my5" />
                  <div>
                     Warmonger Penalty is decreased by <b>{stat.warmongerChange.value}/s</b> until it reaches 0,
                     detailed as follows
                  </div>
                  <div className="flex-table mx-10 mt5">
                     {stat.warmongerChange.detail.map((m) => (
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
                     <span className="text-xs text-green">({-G.runtime.leftStat.warmongerChange.value}/s) </span>
                  ) : null}
                  {Math.ceil(warmongerPenalty)}
               </div>
            </div>
         </Tooltip>
         <div className="row">
            <div className="f1">Backstabber Penalty</div>
            <div>{resourceOf("Backstabber", G.save.state.resources).current}</div>
         </div>
      </div>
   );
}
