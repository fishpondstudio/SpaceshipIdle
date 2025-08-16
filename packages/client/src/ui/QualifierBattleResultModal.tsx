import { Boosters } from "@spaceship-idle/shared/src/game/definitions/Boosters";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { rollBooster } from "@spaceship-idle/shared/src/game/logic/BoosterLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { Sprite } from "pixi.js";
import { G } from "../utils/Global";
import { hideModal } from "../utils/ToggleModal";
import { BattleReportComp } from "./BattleReportComp";
import { DefeatedHeaderComp, VictoryHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { TextureComp } from "./components/TextureComp";
import { playBling } from "./Sound";

export function QualifierBattleResultModal(): React.ReactNode {
   const win = G.runtime.battleStatus === BattleStatus.LeftWin;
   const booster = rollBooster(G.save.current);
   return (
      <div className="m10">
         {win ? <VictoryHeaderComp title="" /> : <DefeatedHeaderComp />}
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
            onClick={(e) => {
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

               const from = (e.target as HTMLButtonElement).getBoundingClientRect();

               GameStateUpdated.emit();
               setTimeout(() => {
                  hideLoading();
                  GameStateUpdated.emit();

                  const target = document.getElementById("bottom-panel-booster")?.getBoundingClientRect();
                  playBling();

                  G.starfield.playParticle(
                     () => {
                        const sprite = new Sprite(G.textures.get(`Booster/${booster}`));
                        sprite.scale.set(2);
                        return sprite;
                     },
                     {
                        x: from.x + from.width / 2,
                        y: from.y + from.height / 2,
                     },
                     {
                        x: target ? target.x + target.width / 2 : 0,
                        y: target ? target.y + target.height / 2 : 0,
                     },
                     1,
                  );
               }, 1000);
            }}
         >
            {t(L.Continue)}
         </button>
      </div>
   );
}
