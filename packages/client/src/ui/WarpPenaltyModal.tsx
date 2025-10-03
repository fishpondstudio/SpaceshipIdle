import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { getStat } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatNumber } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { html } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";

export function WarpPenaltyModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const raw = getStat("Warmonger", G.save.state.stats);
   const min = G.runtime.leftStat.warmongerMin.value;
   const decrease = G.runtime.leftStat.warmongerDecrease.value;
   return (
      <div className="m10">
         <div className="text-dimmed text-sm">{html(t(L.WarpPenaltyHTML), "render-html")}</div>
         <div className="divider dashed mx-10 my10" />
         <div className="row">
            <div className="f1">Warp Penalty to Zero</div>
            <button className="btn">
               {formatNumber((raw - 0) / decrease)} <TextureComp name="Others/Warp16" className="inline-middle" />
            </button>
         </div>
         <div className="divider dashed mx-10 my10" />
         <div className="row">
            <div className="f1">Warp Penalty to Min ({min})</div>
            <button className="btn">
               {formatNumber((raw - min) / decrease)} <TextureComp name="Others/Warp16" className="inline-middle" />
            </button>
         </div>
      </div>
   );
}
