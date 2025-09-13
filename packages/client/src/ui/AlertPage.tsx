import { OnAlert } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { formatHMS, SECOND } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { FloatingTip } from "./components/FloatingTip";
import { html } from "./components/RenderHTMLComp";
import { SidebarComp } from "./components/SidebarComp";

export function AlertPage(): React.ReactNode {
   refreshOnTypedEvent(OnAlert);
   return (
      <SidebarComp title="Event Log">
         {G.save.data.alerts.map((alert) => {
            let info = <div className="mi sm">info</div>;
            if (alert.type === "success") {
               info = <div className="mi sm text-green">check_circle</div>;
            } else if (alert.type === "warning") {
               info = <div className="mi sm text-yellow">warning</div>;
            } else if (alert.type === "error") {
               info = <div className="mi sm text-red">error</div>;
            }
            const timestamp = new Date(alert.time).toLocaleString();
            return (
               <div className="panel m10" key={alert.time}>
                  <div className="title g5">
                     <FloatingTip
                        label={html(t(L.GameTimeRealTimeWallClock, formatHMS(alert.tick * SECOND), timestamp))}
                     >
                        <div>{timestamp}</div>
                     </FloatingTip>
                     <div className="f1"></div>
                     {info}
                  </div>
                  <div className="h5" />
                  <div className="lh-sm text-sm">{alert.message}</div>
               </div>
            );
         })}
      </SidebarComp>
   );
}
