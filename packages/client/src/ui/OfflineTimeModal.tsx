import { formatHMS, formatNumber, mapSafeAdd, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
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
                  const rect = (e.target as HTMLButtonElement).getBoundingClientRect();
                  const target = document.getElementById("ship-info-warp")?.getBoundingClientRect();
                  mapSafeAdd(G.save.current.resources, "Warp", warp);
                  hideModal();
                  playBling();
                  G.starfield.playParticle(
                     G.textures.get("Misc/TimeWarp"),
                     {
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                     },
                     {
                        x: target ? target.x + target.width / 2 : 0,
                        y: target ? target.y + target.height / 2 : 0,
                     },
                     5,
                  );
               }}
            >
               {t(L.TimeWarp)} +{formatNumber(warp)}
            </button>
         </div>
      </div>
   );
}
