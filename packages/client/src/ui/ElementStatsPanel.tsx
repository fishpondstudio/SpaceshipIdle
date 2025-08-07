import { getTotalElementLevels, getTotalElementShards } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export function ElementStatsPanel(): React.ReactNode {
   return (
      <div className="element-stats-panel">
         <div className="row">
            <div className="f1">{t(L.PermanentElementLevels)}</div>
            <div>{getTotalElementLevels(G.save.current)}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.PermanentElementShards)}</div>
            <div>{getTotalElementShards(G.save.current)}</div>
         </div>
      </div>
   );
}
