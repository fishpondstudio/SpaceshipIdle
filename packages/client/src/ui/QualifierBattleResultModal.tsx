import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getTotalQuantum, quantumToXP } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { formatNumber, mapSafeAdd } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { BattleReportComp } from "./BattleReportComp";
import { DefeatedHeaderComp, VictoryHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";

export function QualifierBattleResultModal(): React.ReactNode {
   const oldQuantum = getTotalQuantum(G.runtime.left);
   const newQuantum = getTotalQuantum(G.save.current);
   const win = G.runtime.battleStatus === BattleStatus.LeftWin;
   const xp = win ? quantumToXP(oldQuantum + 1) - quantumToXP(oldQuantum) : 0;
   return (
      <div className="m10">
         {win ? <VictoryHeaderComp /> : <DefeatedHeaderComp />}
         <div className="panel">
            <div className="row">
               <div className="f1">{t(L.Quantum)}</div>
               <div className="text-green">+{newQuantum - oldQuantum}</div>
            </div>
            {xp > 0 ? (
               <div className="row">
                  <div className="f1">{t(L.XP)}</div>
                  <div className="text-green">+{formatNumber(xp)}</div>
               </div>
            ) : null}
         </div>
         <div className="h5" />
         <BattleReportComp />
         <div className="h10" />
         <button
            className="btn w100 filled p5 g5 row text-lg"
            onClick={() => {
               showLoading();
               hideModal();

               G.speed = 1;
               G.runtime = new Runtime(G.save, new GameState());
               G.runtime.battleType = BattleType.Peace;
               G.runtime.createXPTarget();

               mapSafeAdd(G.save.current.resources, "XP", xp);
               GameStateUpdated.emit();
               setTimeout(() => {
                  hideLoading();
                  GameStateUpdated.emit();
               }, 1000);
            }}
         >
            {t(L.Continue)}
         </button>
      </div>
   );
}
