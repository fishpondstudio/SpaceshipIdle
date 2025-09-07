import { addResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatHMS, formatNumber, getElementCenter, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { playBling } from "./Sound";

export function OfflineTimeModal({ offlineTime }: { offlineTime: number }): React.ReactNode {
   const warp = Math.floor(offlineTime / SECOND);
   return (
      <div className="m10">
         <div className="text-center text-sm text-dimmed">{t(L.OfflineTime)}</div>
         <div className="text-center" style={{ fontSize: 48 }}>
            {formatHMS(offlineTime)}
         </div>
         <div className="text-sm">{t(L.OfflineTimeDesc, formatNumber(warp))}</div>
         <div className="h10" />
         <div className="row">
            <button
               className="btn w100 p5 filled"
               onClick={(e) => {
                  addResource("Warp", warp, G.save.state.resources, getElementCenter(e.target as HTMLButtonElement));
                  hideModal();
                  playBling();
               }}
            >
               {t(L.TimeWarp)} +{formatNumber(warp)}
            </button>
         </div>
      </div>
   );
}
