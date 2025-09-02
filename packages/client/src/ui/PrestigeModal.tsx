import { prestige } from "@spaceship-idle/shared/src/game/logic/PrestigeLogic";
import { shardsFromShipValue } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { mReduceOf } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { saveGame } from "../game/LoadSave";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { BattleReportComp } from "./BattleReportComp";
import { DefeatedHeaderComp, PrestigeHeaderComp } from "./components/BattleResultHeader";
import { FloatingTip } from "./components/FloatingTip";
import { showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { PrestigeReason } from "./PrestigeReason";

export function PrestigeModal({ reason }: { reason: PrestigeReason }): React.ReactNode {
   const fromThisRun = mReduceOf(G.save.state.elements, (prev, k, v) => prev + v.hp + v.damage + v.amount, 0);
   const extraShards = shardsFromShipValue(G.save.state);
   return (
      <div className="m10">
         {reason === PrestigeReason.Defeated ? <DefeatedHeaderComp /> : <PrestigeHeaderComp />}
         {reason === PrestigeReason.Incompatible ? (
            <div className="row panel red mb10 text-sm">
               <div className="mi lg fstart">sync_problem</div>
               <div>{t(L.PrestigeReasonInvalidShip)}</div>
            </div>
         ) : null}
         <div className="panel">
            <div className="row">
               <div>{t(L.ElementThisRun)}</div>
               <FloatingTip label={<RenderHTML html={t(L.ElementThisRunTooltipHTML)} />}>
                  <div className="mi sm">info</div>
               </FloatingTip>
               <div className="f1" />
               <div className="text-green">+{fromThisRun}</div>
            </div>
            <div className="h5" />
            <div className="row">
               <div>{t(L.ExtraElementShards)}</div>
               <FloatingTip label={<RenderHTML html={t(L.ExtraElementShardsTooltipHTMLV2)} />}>
                  <div className="mi sm">info</div>
               </FloatingTip>
               <div className="f1" />
               <div className="text-green">+{extraShards}</div>
            </div>
         </div>
         {reason === PrestigeReason.Defeated ? (
            <>
               <div className="h5" />
               <BattleReportComp />
            </>
         ) : null}
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
         {reason === PrestigeReason.None ? (
            <button className="btn w100 p5 row text-lg mt10" onClick={hideModal}>
               <div>{t(L.Close)}</div>
            </button>
         ) : null}
      </div>
   );
}
