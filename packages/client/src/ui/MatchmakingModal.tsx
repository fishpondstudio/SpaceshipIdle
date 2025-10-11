import { getGradient, useMantineTheme } from "@mantine/core";
import { Config } from "@spaceship-idle/shared/src/game/Config";
import { MatchmakingMinimumQuantum, MatchmakingMinimumXP } from "@spaceship-idle/shared/src/game/definitions/Constant";
import { ShipClass } from "@spaceship-idle/shared/src/game/definitions/ShipClass";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { showError } from "@spaceship-idle/shared/src/game/logic/AlertLogic";
import {
   calcShipScore,
   generateMatchmakingShip,
   simulateBattle,
} from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import { BattleStatus } from "@spaceship-idle/shared/src/game/logic/BattleStatus";
import { getWarmongerPenalty } from "@spaceship-idle/shared/src/game/logic/PeaceTreatyLogic";
import { getUsedQuantum } from "@spaceship-idle/shared/src/game/logic/QuantumElementLogic";
import { calcSpaceshipXP, canSpendResource } from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { getShipClass } from "@spaceship-idle/shared/src/game/logic/TechLogic";
import { capitalize, enumOf, formatNumber, iSumOf, resolveIn } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { Generator } from "@spaceship-idle/shared/src/utils/NameGen";
import { findShip } from "../game/Matchmaking";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { hideModal, showModal } from "../utils/ToggleModal";
import { DeclareWarCostComp } from "./components/DeclareWarCostComp";
import { FloatingTip } from "./components/FloatingTip";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { RenderHTML } from "./components/RenderHTMLComp";
import { TextureComp } from "./components/TextureComp";
import { PreBattleModal } from "./PreBattleModal";
import { PrestigeModal } from "./PrestigeModal";
import { PrestigeReason } from "./PrestigeReason";
import { playBling, playClick, playError } from "./Sound";

export function MatchmakingModal(): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const theme = useMantineTheme();
   const usedQuantum = getUsedQuantum(G.save.state);
   const xp = calcSpaceshipXP(G.save.state);
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
               <FloatingTip
                  label={<RenderHTML html={t(L.QualifierBattleQuantumRequirementHTML, MatchmakingMinimumQuantum)} />}
               >
                  <div className="row g5">
                     <TextureComp name={Config.Resources.Quantum.texture} />
                     <div>{t(L.Quantum)}</div>
                     <div className="f1"></div>
                     <div>
                        {usedQuantum}/{MatchmakingMinimumQuantum}
                     </div>
                     {usedQuantum >= MatchmakingMinimumQuantum ? (
                        <div className="mi sm text-green">check_circle</div>
                     ) : (
                        <div className="mi sm text-red">cancel</div>
                     )}
                  </div>
               </FloatingTip>
               <FloatingTip
                  label={
                     <RenderHTML html={t(L.QualifierBattleXPRequirementHTML, formatNumber(MatchmakingMinimumXP))} />
                  }
               >
                  <div className="row g5">
                     <TextureComp name={Config.Resources.XP.texture} />
                     <div>{t(L.SpaceshipXP)}</div>
                     <div className="f1"></div>
                     <div>
                        {formatNumber(xp)}/{formatNumber(MatchmakingMinimumXP)}
                     </div>

                     {xp >= MatchmakingMinimumXP ? (
                        <div className="mi sm text-green">check_circle</div>
                     ) : (
                        <div className="mi sm text-red">cancel</div>
                     )}
                  </div>
               </FloatingTip>
               <FloatingTip label={<DeclareWarCostComp />}>
                  <div className="row g5">
                     <TextureComp name={Config.Resources.VictoryPoint.texture} />
                     <div>{t(L.VictoryPoint)}</div>
                     <div className="f1"></div>
                     <div>{formatNumber(getWarmongerPenalty(G.save.state))}</div>
                     {canSpendResource("VictoryPoint", getWarmongerPenalty(G.save.state), G.save.state.resources) ? (
                        <div className="mi sm text-green">check_circle</div>
                     ) : (
                        <div className="mi sm text-red">cancel</div>
                     )}
                  </div>
               </FloatingTip>
            </div>
         </div>
         <button
            disabled={
               xp < MatchmakingMinimumXP ||
               usedQuantum < MatchmakingMinimumQuantum ||
               !canSpendResource("VictoryPoint", getWarmongerPenalty(G.save.state), G.save.state.resources)
            }
            className="btn filled w100 py5 px10 text-lg"
            onClick={async () => {
               try {
                  playClick();
                  showLoading();
                  const [score, hp, dps] = calcShipScore(G.save.state);
                  if (score > 0) {
                     RPCClient.saveShipV2(G.save.state).catch(console.error);
                  }
                  let ship = (await findShip(score, hp, dps))?.json;
                  if (!ship) {
                     ship = generateMatchmakingShip(
                        getShipClass(G.save.state),
                        Math.ceil(iSumOf(G.save.state.tiles, ([_, data]) => data.level) / G.save.state.tiles.size),
                        score,
                        hp,
                        dps,
                        Math.random,
                     );
                     ship.name = capitalize(new Generator("ssV").toString());
                     console.log("Matchmaking: generate enemy ship", ship);
                  }
                  await resolveIn(1, null);

                  if (import.meta.env.DEV) {
                     const rt = simulateBattle(G.save.state, ship);
                     console.log(`Battle with ${ship} result: ${enumOf(BattleStatus, rt.battleStatus)}`);
                  }

                  playBling();
                  hideLoading();
                  showModal({
                     children: <PreBattleModal enemy={ship} info={{ hideEnemyInfo: true }} />,
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
               playClick();
               showModal({
                  title: t(L.Prestige),
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
