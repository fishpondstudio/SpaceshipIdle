import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { refreshOnTypedEvent } from "../utils/Hook";

export function GalaxyInfoPanel(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <div className="top-left-panel text-sm">
         <div className="row">
            <div className="f1">Current Friendship</div>
            <div>1/3</div>
         </div>
         <div className="row">
            <div className="f1">Backstabbing Penalty</div>
            <div>2</div>
         </div>
      </div>
   );
}
