import { TrialQuantum } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { BattleReportComp } from "./BattleReportComp";
import { DefeatedHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";

export function SecondChanceBattleResultModal(): React.ReactNode {
   return (
      <div className="m10">
         <DefeatedHeaderComp />
         <div className="text-sm">
            <RenderHTML html={t(L.SecondChanceDescHTML)} />
         </div>
         <div className="h10" />
         <div className="panel">
            <div className="row">
               <div className="f1">{t(L.Quantum)}</div>
               <div className="text-green">+{TrialQuantum}</div>
            </div>
         </div>
         <div className="h5" />
         <BattleReportComp />
         <div className="h10" />
         <button
            className="btn w100 filled p5 text-lg"
            onClick={() => {
               showLoading();
               hideModal();

               G.speed = 1;
               G.runtime = new Runtime(G.save, new GameState());
               G.runtime.battleType = BattleType.Peace;
               G.runtime.createXPTarget();
               GameStateUpdated.emit();

               setTimeout(() => {
                  hideLoading();
               }, 1000);
            }}
         >
            <div>{t(L.Continue)}</div>
         </button>
      </div>
   );
}
