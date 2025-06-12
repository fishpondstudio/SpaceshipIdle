import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ChangePlayerHandleComp } from "./ChangePlayerHandleComp";

export function PlayerProfileModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <div className="m10">
         <ChangePlayerHandleComp />
      </div>
   );
}
