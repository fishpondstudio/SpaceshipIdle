import { DiscordUrl, SteamUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameOptionFlag } from "@spaceship-idle/shared/src/game/GameOption";
import { hasFlag } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { memo } from "react";
import Discord from "../../src/assets/images/Discord.svg";
import Steam from "../../src/assets/images/Steam.svg";
import { openUrl } from "../rpc/SteamClient";
import { G } from "../utils/Global";
import { FloatingTip } from "./components/FloatingTip";

export function TopRightPanel(): React.ReactNode {
   const options = G.save.options;
   return (
      <div className="top-right-panel">
         <SteamComp show={!hasFlag(options.flag, GameOptionFlag.HideSteamIcon)} />
         <DiscordComp show={!hasFlag(options.flag, GameOptionFlag.HideDiscordIcon)} />
      </div>
   );
}

function _DiscordComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <FloatingTip label={t(L.JoinDiscord)}>
         <img src={Discord} style={{ display: "block", height: 20 }} onClick={() => openUrl(DiscordUrl)} />
      </FloatingTip>
   );
}

export const DiscordComp = memo(_DiscordComp, (prev, next) => prev.show === next.show);

function _SteamComp({ show }: { show: boolean }): React.ReactNode {
   if (!show) return null;
   return (
      <FloatingTip label={t(L.WishlistFullGame)}>
         <img src={Steam} style={{ display: "block", height: 20 }} onClick={() => openUrl(SteamUrl)} />
      </FloatingTip>
   );
}

export const SteamComp = memo(_SteamComp, (prev, next) => prev.show === next.show);
