import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { DefeatedHeaderComp, VictoryHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";

export function PracticeBattleResultModal(): React.ReactNode {
   return (
      <div style={{ padding: 5 }}>
         {G.runtime.battleStatus === BattleStatus.RightWin ? <DefeatedHeaderComp /> : <VictoryHeaderComp />}
         <RenderHTML html={t(L.PracticeBattleDescHTML)} />
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
      </div>
   );
}
