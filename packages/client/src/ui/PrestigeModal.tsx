import { Tooltip } from "@mantine/core";
import { shardsFromShipValue } from "@spaceship-idle/shared/src/game/logic/ElementLogic";
import { prestige } from "@spaceship-idle/shared/src/game/logic/PrestigeLogic";
import { mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { saveGame } from "../game/LoadSave";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { DefeatedHeaderComp, PrestigeHeaderComp } from "./components/BattleResultHeader";
import { showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";

export function PrestigeModal({ defeated }: { defeated: boolean }): React.ReactNode {
   const fromThisRun = mReduceOf(G.save.current.elements, (prev, k, v) => prev + v, 0);
   const extraShards = shardsFromShipValue(G.save.current);
   return (
      <div style={{ padding: 5 }}>
         {defeated ? <DefeatedHeaderComp /> : <PrestigeHeaderComp />}
         <div className="panel">
            <div className="row">
               <div>{t(L.ElementThisRun)}</div>
               <Tooltip label={<RenderHTML html={t(L.ElementThisRunTooltipHTML)} />}>
                  <div className="mi sm">info</div>
               </Tooltip>
               <div className="f1" />
               <div className="text-green">+{fromThisRun}</div>
            </div>
            <div className="h5" />
            <div className="row">
               <div>{t(L.ExtraElementShards)}</div>
               <Tooltip label={<RenderHTML html={t(L.ExtraElementShardsTooltipHTML)} />}>
                  <div className="mi sm">info</div>
               </Tooltip>
               <div className="f1" />
               <div className="text-green">+{extraShards}</div>
            </div>
         </div>
         <div className="h10" />
         <button
            className="btn w100 filled p5 g5 row text-lg"
            onClick={async () => {
               hideModal();
               showLoading();
               prestige(G.save);
               await saveGame(G.save);
               window.location.reload();
            }}
         >
            <div>{t(L.Prestige)}</div>
            <div>
               +{fromThisRun + extraShards} {t(L.Shards)}
            </div>
         </button>
      </div>
   );
}
