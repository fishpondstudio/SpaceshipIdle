import { getGradient, Tooltip, useMantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { GameStateUpdated } from "@spaceship-idle/shared/src/game/GameState";
import { calcShipScore } from "@spaceship-idle/shared/src/game/logic/BattleLogic";
import {
   calcSpaceshipXP,
   getMatchmakingQuantum,
   getQuantumLimit,
   getUsedQuantum,
   quantumToXP,
} from "@spaceship-idle/shared/src/game/logic/ResourceLogic";
import { formatNumber, resolveIn } from "@spaceship-idle/shared/src/utils/Helper";
import { L, t } from "@spaceship-idle/shared/src/utils/i18n";
import { RPCClient } from "../rpc/RPCClient";
import { G } from "../utils/Global";
import { refreshOnTypedEvent } from "../utils/Hook";
import { hideModal, showModal } from "../utils/ToggleModal";
import { hideLoading, showLoading } from "./components/LoadingComp";
import { MatchMakingModal } from "./MatchmakingModal";
import { PrepareForBattleMode } from "./PrepareForBattleMode";
import { PrestigeModal } from "./PrestigeModal";
import { PrestigeReason } from "./PrestigeReason";
import { playBling, playClick, playError } from "./Sound";

export function PrepareForBattleModal({ mode }: { mode: PrepareForBattleMode }): React.ReactNode {
   refreshOnTypedEvent(GameStateUpdated);
   const theme = useMantineTheme();
   const quantum = getMatchmakingQuantum(G.save.current);
   const quantumLimit = getQuantumLimit(G.save.current);
   const usedQuantum = getUsedQuantum(G.save.current);
   return (
      <div style={{ padding: 5 }}>
         <div
            className="p10 mb10 col cc"
            style={{
               position: "relative",
               color: "#fff",
               borderRadius: "5px",
               background: getGradient({ deg: 180, from: "space.5", to: "space.9" }, theme),
            }}
         >
            <div className="mi pointer" style={{ position: "absolute", top: 10, right: 10 }} onClick={hideModal}>
               close
            </div>
            <div className="mi" style={{ fontSize: 128 }}>
               trophy
            </div>
            <div style={{ fontSize: 24 }}>{t(L.QuantumXLeague, quantum)}</div>
         </div>
         {mode === PrepareForBattleMode.Prompt ? (
            <div className="text-red text-sm mb10">{t(L.ReachedQuantumLimit, quantumLimit)}</div>
         ) : null}
         <div className="panel mb10 p0">
            <div className="row g5 mt10">
               <div className="f1" style={{ height: 2, background: "var(--mantine-color-green-4)" }}></div>
               <div className="mi" style={{ color: "var(--mantine-color-green-4)" }}>
                  check_circle
               </div>
               <div className="f1" style={{ height: 2, background: "var(--mantine-color-green-4)" }}></div>
               <div className="mi breathing" style={{ color: "var(--mantine-color-orange-4)" }}>
                  swords
               </div>
               <div className="f1" style={{ height: 2, background: "var(--mantine-color-dark-4)" }}></div>
               <div className="mi" style={{ color: "var(--mantine-color-dark-4)" }}>
                  radio_button_unchecked
               </div>
               <div className="f1" style={{ height: 2, background: "var(--mantine-color-dark-4)" }}></div>
            </div>
            <div className="row g5 text-center text-sm">
               <div className="f1" />
               <Tooltip label={t(L.MaxSpaceshipXP, formatNumber(quantumToXP(quantum - 10)))}>
                  <div style={{ color: "var(--mantine-color-green-4)" }}>Q{quantum - 10}</div>
               </Tooltip>
               <div className="f1" />
               <Tooltip label={t(L.MaxSpaceshipXP, formatNumber(quantumToXP(quantum)))}>
                  <div style={{ color: "var(--mantine-color-orange-4)" }}>Q{quantum}</div>
               </Tooltip>
               <div className="f1" />
               <Tooltip label={t(L.MaxSpaceshipXP, formatNumber(quantumToXP(quantum + 10)))}>
                  <div style={{ color: "var(--mantine-color-dark-4)" }}>Q{quantum + 10}</div>
               </Tooltip>
               <div className="f1" />
            </div>
            <div className="divider mt5" />
            <div className="row p10">
               <div>{t(L.Quantum)}</div>
               <div className="f1"></div>
               <div>
                  {usedQuantum}/{quantumLimit}
               </div>
            </div>
            <div className="divider" />
            <div className="row p10">
               <div>{t(L.SpaceshipXP)}</div>
               <div className="f1"></div>
               <div>
                  {formatNumber(calcSpaceshipXP(G.save.current))}/{formatNumber(quantumToXP(quantum))}
               </div>
            </div>
         </div>
         <button
            className="btn filled w100 py5 px10 text-lg"
            onClick={async () => {
               try {
                  playClick();
                  showLoading();
                  const [score] = calcShipScore(G.save.current);
                  const ship = await RPCClient.findShipV2(getMatchmakingQuantum(G.save.current), score);
                  await resolveIn(1, null);
                  playBling();
                  hideLoading();
                  showModal({
                     children: <MatchMakingModal enemy={ship.json} />,
                     size: "lg",
                     dismiss: true,
                  });
               } catch (e) {
                  playError();
                  hideLoading();
                  notifications.show({ position: "top-center", color: "red", message: String(e) });
               }
            }}
         >
            {t(L.FindOpponent)}
         </button>
         <div className="h10" />
         {mode === PrepareForBattleMode.Prompt ? (
            <button className="btn w100 p5 row text-lg" onClick={hideModal}>
               {t(L.Close)}
            </button>
         ) : (
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
         )}
      </div>
   );
}
