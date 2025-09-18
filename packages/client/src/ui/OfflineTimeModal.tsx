import { addResource, getMaxTimeWarp, resourceOf } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { clamp, formatHMS, formatNumber, getElementCenter, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { FloatingTip } from "./components/FloatingTip";
import { playBling, playClick } from "./Sound";
import { MaxTimeWarpComp } from "./WarpSpeedMenuComp";

export function OfflineTimeModal({ offlineTime }: { offlineTime: number }): React.ReactNode {
   const warp = Math.floor(offlineTime / SECOND);
   const [max, breakdown] = getMaxTimeWarp(G.save.state);
   const currentWarp = resourceOf("Warp", G.save.state.resources).current;
   const warpToAdd = clamp(clamp(warp + currentWarp, 0, max * 3600) - currentWarp, 0, Number.POSITIVE_INFINITY);
   return (
      <div className="m10">
         <div className="text-center text-sm text-dimmed">{t(L.OfflineTime)}</div>
         <div className="text-center" style={{ fontSize: 48 }}>
            {formatHMS(offlineTime)}
         </div>
         <div className="text-sm">{t(L.OfflineTimeDescV2, formatNumber(warp))}</div>
         <div className="divider dashed mx-10 my5" />
         <div className="row g5">
            <div className="f1">{t(L.TimeWarp)}</div>
            <div className="text-right">
               <span className="text-dimmed text-sm">({formatNumber(currentWarp)})</span>{" "}
               {t(L.XHourShort, formatNumber(currentWarp / 3600))}
            </div>
         </div>
         <FloatingTip w={300} label={<MaxTimeWarpComp gs={G.save.state} />}>
            <div className="row g5">
               <div className="f1">{t(L.MaxTimeWarp)}</div>
               <div className="text-right">{t(L.XHourShort, formatNumber(max))}</div>
            </div>
         </FloatingTip>
         {warp + currentWarp > max * 3600 ? (
            <div className="text-yellow text-sm">
               <div className="mi sm inline">error</div> {t(L.MaxTimeWarpReachedDesc)}
            </div>
         ) : null}
         <div className="divider dashed mx-10 my5" />
         <div className="h5" />
         <div className="row">
            <button
               className="btn w100 p5 filled"
               onClick={(e) => {
                  if (warpToAdd > 0) {
                     playBling();
                     addResource("Warp", warp, G.save.state.resources, getElementCenter(e.target as HTMLButtonElement));
                  } else {
                     playClick();
                  }
                  hideModal();
               }}
            >
               {t(L.TimeWarp)} +{formatNumber(warpToAdd)}
            </button>
         </div>
      </div>
   );
}
