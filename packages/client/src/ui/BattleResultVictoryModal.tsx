import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { getQuantumLimit, quantumToXP } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { formatNumber, mapSafeAdd } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal, showModal } from "../utils/ToggleModal";
import { BattleReportComp } from "./BattleReportComp";
import { VictoryHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { PrestigeModal } from "./PrestigeModal";
import { PrestigeReason } from "./PrestigeReason";

export function BattleResultVictoryModal(): React.ReactNode {
   const oldQuantum = getQuantumLimit(G.runtime.left);
   const newQuantum = getQuantumLimit(G.save.current);
   const isSecondChance = G.runtime.left.trialCount > 0;
   const xp = isSecondChance ? 0 : quantumToXP(oldQuantum + 1) - quantumToXP(oldQuantum);
   return (
      <div style={{ padding: 5 }}>
         <VictoryHeaderComp />
         <div className="panel">
            <div className="row">
               <div className="f1">{t(L.Quantum)}</div>
               <div className="text-green">+{newQuantum - oldQuantum}</div>
            </div>
            {xp > 0 ? (
               <>
                  <div className="h5" />
                  <div className="row">
                     <div className="f1">{t(L.XP)}</div>
                     <div className="text-green">+{formatNumber(xp)}</div>
                  </div>
               </>
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
               G.runtime.createEnemy();

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
         <div className="h10" />
         <button
            className="btn w100 p5 row text-lg"
            onClick={() => {
               showModal({
                  children: <PrestigeModal reason={PrestigeReason.None} />,
                  size: "sm",
                  dismiss: true,
               });
            }}
         >
            {t(L.PrestigeAnyway)}
         </button>
      </div>
   );
}
