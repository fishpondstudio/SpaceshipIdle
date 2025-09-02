import {
   getTotalElementLevels,
   getTotalElementShards,
} from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";

export function ElementStatsPanel(): React.ReactNode {
   return (
      <div className="top-left-panel">
         <div className="row">
            <div className="f1">{t(L.PermanentElementLevels)}</div>
            <div>{getTotalElementLevels(G.save.state)}</div>
         </div>
         <div className="row">
            <div className="f1">{t(L.PermanentElementShards)}</div>
            <div>{getTotalElementShards(G.save.state)}</div>
         </div>
      </div>
   );
}
