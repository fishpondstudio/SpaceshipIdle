import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { G } from "../utils/Global";
import { DiscordComp, SteamComp } from "./ShipInfoPanel";

export function TopRightPanel(): React.ReactNode {
   const options = G.save.options;
   return (
      <div className="top-right-panel">
         <SteamComp show={!hasFlag(options.flag, GameOptionFlag.HideSteamIcon)} />
         <DiscordComp show={!hasFlag(options.flag, GameOptionFlag.HideDiscordIcon)} />
      </div>
   );
}
