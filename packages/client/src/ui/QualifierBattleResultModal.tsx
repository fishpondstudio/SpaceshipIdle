import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { rollBooster } from "@spaceship-idle/shared/src/game/logic/BoosterLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { BattleReportComp } from "./BattleReportComp";
import { DefeatedHeaderComp, VictoryHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { TextureComp } from "./components/TextureComp";

export function QualifierBattleResultModal(): React.ReactNode {
   const win = G.runtime.battleStatus === BattleStatus.LeftWin;
   const booster = rollBooster(G.save.current);
   return (
      <div className="m10">
         {win ? <VictoryHeaderComp /> : <DefeatedHeaderComp />}
         <div className="panel">
            {booster ? (
               <div className="row">
                  <TextureComp name={`Booster/${booster}`} width={32} />
                  <div className="f1">{Boosters[booster].name()}</div>
                  <div>+1</div>
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

               if (booster) {
                  const data = G.save.current.boosters.get(booster);
                  if (data) {
                     data.amount++;
                  } else {
                     G.save.current.boosters.set(booster, { tile: null, amount: 1 });
                  }
               }

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
