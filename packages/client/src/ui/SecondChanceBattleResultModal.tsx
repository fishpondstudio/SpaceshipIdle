import { TrialQuantum } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal, showModal } from "../utils/ToggleModal";
import { DefeatedHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { PrestigeModal } from "./PrestigeModal";
import { PrestigeReason } from "./PrestigeReason";

export function SecondChanceBattleResultModal(): React.ReactNode {
   return (
      <div style={{ padding: 5 }}>
         <DefeatedHeaderComp />
         <div className="text-dimmed text-sm">
            <RenderHTML html={t(L.SecondChanceDescHTML)} />
         </div>
         <div className="h10" />
         <div className="panel">
            <div className="row">
               <div className="f1">{t(L.QuantumLimit)}</div>
               <div className="text-green">+{TrialQuantum}</div>
            </div>
         </div>
         <div className="h10" />
         <button
            className="btn w100 filled p5 text-lg"
            onClick={() => {
               showLoading();
               hideModal();

               G.speed = 1;
               G.runtime = new Runtime(G.save, new GameState());
               G.runtime.battleType = BattleType.Peace;
               G.runtime.createEnemy(1);
               GameStateUpdated.emit();

               setTimeout(() => {
                  hideLoading();
               }, 1000);
            }}
         >
            <div>{t(L.Continue)}</div>
         </button>
         <div className="h10" />
         <button
            className="btn w100 p5 row text-lg"
            onClick={() => {
               showModal({
                  children: <PrestigeModal reason={PrestigeReason.None} />,
                  size: "sm",
               });
            }}
         >
            {t(L.PrestigeAnyway)}
         </button>
      </div>
   );
}
