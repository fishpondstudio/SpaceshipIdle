import { getGradient, useMantineTheme } from "@mantine/core";
import { QualifierSpaceshipValuePercent } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/TechDefinitions";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import { calcShipScore, simulateBattle } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import {
   calcSpaceshipXP,
   getMinimumQuantumForBattle,
   getMinimumSpaceshipXPForBattle,
   getUsedQuantum,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { enumOf, formatNumber, resolveIn } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { findShip } from "../game/Matchmaking";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { hideModal, showModal } from "../utils/ToggleModal";
import { FloatingTip } from "./components/FloatingTip";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { PreBattleModal } from "./PreBattleModal";
import { PrestigeModal } from "./PrestigeModal";
import { PrestigeReason } from "./PrestigeReason";
import { playBling, playClick, playError } from "./Sound";

export function MatchmakingModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const theme = useMantineTheme();
   const minQuantum = getMinimumQuantumForBattle(G.save.state);
   const usedQuantum = getUsedQuantum(G.save.state);
   const xp = calcSpaceshipXP(G.save.state);
   const minXO = getMinimumSpaceshipXPForBattle(G.save.state);
   return (
      <div className="m10">
         <div
            className="p10 mb10 col cc"
            style={{
               position: "relative",
               color: "#fff",
               borderRadius: "5px",
               background: getGradient({ deg: 180, from: "space.5", to: "space.9" }, theme),
            }}
         >
            <div className="mi pointer" style={{ position: "absolute", top: 5, right: 5 }} onClick={hideModal}>
               close
            </div>
            <div className="mi" style={{ fontSize: 128 }}>
               trophy
            </div>
            <div style={{ fontSize: 24 }}>{t(L.XClassLeague, ShipClass[getShipClass(G.save.state)].name())}</div>
         </div>
         <div className="panel mb10 p0">
            <div className="m10">
               <div className="row">
                  <div>{t(L.Quantum)}</div>
                  <div className="f1"></div>
                  <div>
                     {usedQuantum}/{minQuantum}
                  </div>
                  <FloatingTip label={<RenderHTML html={t(L.QualifierBattleQuantumRequirementHTML, minQuantum)} />}>
                     {usedQuantum >= minQuantum ? (
                        <div className="mi sm text-green">check_circle</div>
                     ) : (
                        <div className="mi sm text-yellow">info</div>
                     )}
                  </FloatingTip>
               </div>
               <div className="row">
                  <div>{t(L.SpaceshipXP)}</div>
                  <div className="f1"></div>
                  <div>
                     {formatNumber(xp)}/{formatNumber(minXO)}
                  </div>
                  <FloatingTip label={<RenderHTML html={t(L.QualifierBattleXPRequirementHTML, formatNumber(minXO))} />}>
                     {xp >= QualifierSpaceshipValuePercent * minXO ? (
                        <div className="mi sm text-green">check_circle</div>
                     ) : (
                        <div className="mi sm text-yellow">info</div>
                     )}
                  </FloatingTip>
               </div>
            </div>
         </div>
         <button
            className="btn filled w100 py5 px10 text-lg"
            onClick={async () => {
               try {
                  playClick();
                  showLoading();
                  const [score, hp, dps] = calcShipScore(G.save.state);
                  const ship = await findShip(score, hp, dps);
                  await resolveIn(1, null);

                  if (import.meta.env.DEV) {
                     const rt = simulateBattle(G.save.state, ship.json);
                     console.log(`Battle with ${ship.shipId} result: ${enumOf(BattleStatus, rt.battleStatus)}`);
                  }

                  playBling();
                  hideLoading();
                  showModal({
                     children: <PreBattleModal enemy={ship.json} info={{}} />,
                     size: "lg",
                     dismiss: true,
                  });
               } catch (e) {
                  playError();
                  hideLoading();
                  console.error(e);
                  showError(String(e));
               }
            }}
         >
            {t(L.FindOpponent)}
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
            {t(L.Prestige)}
         </button>
      </div>
   );
}
