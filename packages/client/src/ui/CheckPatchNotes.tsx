import { notifications } from "@mantine/notifications";
import { PatchNotesUrl } from "@spaceship-idle/shared/src/game/definitions/Constant";
import type { GameOption } from "@spaceship-idle/shared/src/game/GameOption";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { getBuildNumber, getVersion } from "../game/Version";
import { openUrl } from "../rpc/SteamClient";
import { html } from "./components/RenderHTMLComp";
import { playClick } from "./Sound";

export function checkPatchNotes(options: GameOption): void {
   if (options.build === getBuildNumber()) {
      return;
   }
   options.build = getBuildNumber();
   const id = notifications.show({
      message: (
         <div
            className="pointer row"
            onClick={() => {
               playClick();
               openUrl(PatchNotesUrl);
               notifications.hide(id);
            }}
         >
            <div className="mi lg text-green">arrow_circle_up</div>
            {html(t(L.YouVeUpdatedToPatchClickHereToReadThePatchNotes, getVersion()), "render-html")}
         </div>
      ),
      position: "top-center",
      color: "green",
      withBorder: true,
      autoClose: false,
   });
}
