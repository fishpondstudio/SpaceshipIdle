import { BattleQuantum } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { GameState, GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { BattleType } from "@spaceship-idle/shared/src/game/logic/BattleType";
import { calcSpaceshipValue } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { Runtime } from "@spaceship-idle/shared/src/game/logic/Runtime";
import { formatNumber, mapSafeAdd } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { G } from "../utils/Global";
import { hideModal, showModal } from "../utils/ToggleModal";
import { VictoryHeaderComp } from "./components/BattleResultHeader";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { PrestigeModal } from "./PrestigeModal";
import { PrestigeReason } from "./PrestigeReason";

export function BattleResultVictoryModal(): React.ReactNode {
   const weaponFire = G.runtime.left.resources.get("XP") ?? 0;
   const enemySalvage = calcSpaceshipValue(G.runtime.originalRight);
   const xpGained = weaponFire + enemySalvage;
   return (
      <div style={{ padding: 5 }}>
         <VictoryHeaderComp />
         <div className="panel">
            <div className="row">
               <div className="f1">{t(L.QuantumLimit)}</div>
               <div className="text-green">+{BattleQuantum}</div>
            </div>
            <div className="h5" />
            <div className="row">
               <div className="f1">{t(L.WeaponFire)}</div>
               <div className="text-green">+{formatNumber(weaponFire)}</div>
            </div>
            <div className="h5" />
            <div className="row">
               <div className="f1">{t(L.EnemySalvage)}</div>
               <div className="text-green">+{formatNumber(enemySalvage)}</div>
            </div>
         </div>
         <div className="h10" />
         <button
            className="btn w100 filled p5 g5 row text-lg"
            onClick={() => {
               showLoading();
               hideModal();

               G.speed = 1;
               G.runtime = new Runtime(G.save, new GameState());
               G.runtime.battleType = BattleType.Peace;
               G.runtime.createEnemy(1);

               mapSafeAdd(G.save.current.resources, "XP", xpGained);
               GameStateUpdated.emit();
               setTimeout(() => {
                  hideLoading();
                  GameStateUpdated.emit();
               }, 1000);
            }}
         >
            <div>{t(L.Continue)}</div>
            <div>
               +{formatNumber(xpGained)} {t(L.XP)}
            </div>
         </button>
         <div className="h10" />
         <button
            className="btn w100 p5 row text-lg"
            onClick={() => {
               showModal({
                  children: <PrestigeModal reason={PrestigeReason.None} showClose={true} />,
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
