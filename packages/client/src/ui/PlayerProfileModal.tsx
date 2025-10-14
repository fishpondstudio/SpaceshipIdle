import { SteamUrlWebFTUE } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { isSteam, openUrl } from "../rpc/SteamClient";
import { refreshOnTypedEvent } from "../utils/Hook";
import { ChangePlayerHandleComp } from "./ChangePlayerHandleComp";

export function PlayerProfileModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   return (
      <div className="m10">
         {!isSteam() ? (
            <div className="panel mb10 text-sm yellow row pointer" onClick={() => openUrl(SteamUrlWebFTUE)}>
               {t(L.GuestWebAccountWarning)}
               <div className="mi">open_in_new</div>
            </div>
         ) : null}
         <ChangePlayerHandleComp />
      </div>
   );
}
