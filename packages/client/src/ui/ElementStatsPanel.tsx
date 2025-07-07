import { Tooltip } from "@mantine/core";
import { getTotalElementLevels, getTotalElementShards } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { getQuantumFromPermanentElement } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { RenderHTML } from "./components/RenderHTMLComp";

export function ElementStatsPanel(): React.ReactNode {
   return (
      <div className="element-stats-panel">
         <div className="row">
            <div className="f1">{t(L.PermanentElementLevels)}</div>
            <div>{getTotalElementLevels(G.save.current)}</div>
         </div>
         <Tooltip label={<RenderHTML html={t(L.QuantumFromPermanentElementTooltipHTML)} />}>
            <div className="row">
               <div className="f1 row g5">
                  {t(L.QuantumFromPermanentElement)}

                  <div className="mi sm">info</div>
               </div>
               <div>{getQuantumFromPermanentElement(G.save.current)}</div>
            </div>
         </Tooltip>
         <div className="row">
            <div className="f1">{t(L.PermanentElementShards)}</div>
            <div>{getTotalElementShards(G.save.current)}</div>
         </div>
      </div>
   );
}
